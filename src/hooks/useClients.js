import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { calcVolumeCEE, isCoupDePouceX3 } from '../lib/cee'

const SELECT = '*, crm179_contacts(*)'

// Colonnes interdites en INSERT/UPDATE (managées par Postgres ou non-colonnes)
const READONLY_INSERT = ['id', 'created_at', 'updated_at', 'crm179_contacts']
const READONLY_UPDATE = [...READONLY_INSERT, 'client_id']  // client_id ne change jamais

const stripFields = (obj, fields) => {
  if (!obj || typeof obj !== 'object') return obj
  const out = {}
  for (const k of Object.keys(obj)) {
    if (!fields.includes(k)) out[k] = obj[k]
  }
  return out
}

// Cast tous les champs numériques en number (ou null si vide)
const num = (v) => v === '' || v == null ? null : Number(v)

export function useClients () {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('crm179_clients')
      .select(SELECT)
      .order('created_at', { ascending: false })
    setLoading(false)
    if (error) { console.error('[useClients] reload error:', error); return }
    data?.forEach(c => c.crm179_contacts?.sort((a,b)=>a.ordre-b.ordre))
    setClients(data || [])
  }, [])

  useEffect(() => { reload() }, [reload])

  /**
   * Normalise tout le payload :
   *  - cast les numériques
   *  - calcule coup_de_pouce_x3, volume_cee_estime, reste_charge
   *  - garde uniquement les colonnes valides
   */
  const enrichBeforeSave = (payload, mode='update') => {
    const t = payload.caracteristiques_techniques || {}
    const cdp = isCoupDePouceX3(payload.energie_remplacee)
    const vol = calcVolumeCEE({
      usage: t.usage,
      zone:  payload.zone_climatique,
      nbLogements: payload.nb_logements,
      energieRemplacee: payload.energie_remplacee,
      etas: t.etas
    })
    const d = payload.devis || {}
    const ttc   = Number(d.montant_ttc || 0)
    const prime = Number(d.prime_cee   || 0)
    const reste = Math.max(0, Math.round(ttc - prime))

    const next = {
      ...payload,
      // Numérisation
      nb_logements:      num(payload.nb_logements),
      score_chaleur:     num(payload.score_chaleur) ?? 0,
      gps_lat:           num(payload.gps_lat),
      gps_lng:           num(payload.gps_lng),
      prime_cee_reelle:  num(payload.prime_cee_reelle),
      // Calculs auto
      coup_de_pouce_x3:  cdp,
      volume_cee_estime: vol,
      devis: { ...d,
        montant_ht:   num(d.montant_ht),
        montant_ttc:  num(d.montant_ttc),
        prime_cee:    num(d.prime_cee),
        acompte:      num(d.acompte),
        reste_charge: reste
      }
    }
    return stripFields(next, mode === 'insert' ? READONLY_INSERT : READONLY_UPDATE)
  }

  const create = useCallback(async (payload) => {
    const { data: idRes } = await supabase.rpc('crm179_next_client_id')
    const client_id = idRes || `CL-${new Date().getFullYear()}-XXXX`
    const enriched = enrichBeforeSave({ client_id, ...payload }, 'insert')
    const { data, error } = await supabase
      .from('crm179_clients').insert(enriched).select().single()
    if (error) {
      console.error('[useClients] create error:', error)
      throw new Error(error.message || 'Erreur lors de la création')
    }
    await supabase.from('crm179_timeline').insert({
      client_id: data.id, type_event: 'creation',
      description: `Création de la fiche ${data.client_id}`
    })
    await reload()
    return data
  }, [reload])

  const update = useCallback(async (id, patch, ancienStatut) => {
    const enriched = enrichBeforeSave(patch, 'update')
    const { data, error } = await supabase
      .from('crm179_clients').update(enriched).eq('id', id).select().single()
    if (error) {
      console.error('[useClients] update error:', error, 'payload:', enriched)
      throw new Error(error.message || 'Erreur lors de la sauvegarde')
    }
    if (ancienStatut && patch.statut_client && ancienStatut !== patch.statut_client) {
      await supabase.from('crm179_timeline').insert({
        client_id: id, type_event: 'statut',
        description: `Changement de statut`,
        ancien_statut: ancienStatut, nouveau_statut: patch.statut_client
      })
    }
    await reload()
    return data
  }, [reload])

  const remove = useCallback(async (id) => {
    const { error } = await supabase.from('crm179_clients').delete().eq('id', id)
    if (error) throw new Error(error.message || 'Erreur lors de la suppression')
    await reload()
  }, [reload])

  const duplicate = useCallback(async (id) => {
    const src = clients.find(c => c.id === id)
    if (!src) return
    // eslint-disable-next-line no-unused-vars
    const { id:_, client_id:__, created_at:___, updated_at:____, crm179_contacts: contacts, ...rest } = src
    const created = await create({ ...rest, raison_sociale: (rest.raison_sociale||'') + ' (copie)' })
    if (contacts?.length) {
      await supabase.from('crm179_contacts').insert(
        contacts.map(c => ({ ...c, id: undefined, client_id: created.id }))
      )
      await reload()
    }
    return created
  }, [clients, create, reload])

  const upsertContacts = useCallback(async (clientUuid, contactsArr=[]) => {
    await supabase.from('crm179_contacts').delete().eq('client_id', clientUuid)
    const valid = contactsArr
      .filter(c => c && (c.nom || c.prenom || c.email || c.tel_mobile || c.tel_fixe))
      .map((c,i) => ({
        ordre:    i+1,
        civilite: c.civilite || null,
        nom:      c.nom || null,
        prenom:   c.prenom || null,
        fonction: c.fonction || null,
        tel_fixe: c.tel_fixe || null,
        tel_mobile: c.tel_mobile || null,
        email:    c.email || null,
        client_id: clientUuid
      }))
    if (valid.length) {
      const { error } = await supabase.from('crm179_contacts').insert(valid)
      if (error) throw new Error(error.message || 'Erreur lors de la sauvegarde des contacts')
    }
    await reload()
  }, [reload])

  return { clients, loading, reload, create, update, remove, duplicate, upsertContacts }
}
