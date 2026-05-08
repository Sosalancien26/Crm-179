import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { calcVolumeCEE, isCoupDePouceX3 } from '../lib/cee'

const SELECT = '*, crm179_contacts(*)'

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
    if (error) { console.error(error); return }
    // Tri des contacts par ordre
    data.forEach(c => c.crm179_contacts?.sort((a,b)=>a.ordre-b.ordre))
    setClients(data || [])
  }, [])

  useEffect(() => { reload() }, [reload])

  const enrichBeforeSave = (payload) => {
    const t = payload.caracteristiques_techniques || {}
    const cdp = isCoupDePouceX3(payload.energie_remplacee)
    const vol = calcVolumeCEE({
      usage: t.usage,
      zone:  payload.zone_climatique,
      nbLogements: payload.nb_logements,
      energieRemplacee: payload.energie_remplacee,
      etas: t.etas
    })
    // Reste à charge auto
    const d = payload.devis || {}
    const ttc   = Number(d.montant_ttc || 0)
    const prime = Number(d.prime_cee || 0)
    const reste = Math.max(0, Math.round(ttc - prime))
    return {
      ...payload,
      coup_de_pouce_x3: cdp,
      volume_cee_estime: vol,
      devis: { ...d, reste_charge: reste }
    }
  }

  const create = useCallback(async (payload) => {
    // Génère ID lisible côté serveur via RPC
    const { data: idRes } = await supabase.rpc('crm179_next_client_id')
    const client_id = idRes || `CL-${new Date().getFullYear()}-XXXX`
    const enriched = enrichBeforeSave({ client_id, ...payload })
    const { data, error } = await supabase
      .from('crm179_clients').insert(enriched).select().single()
    if (error) throw error
    await supabase.from('crm179_timeline').insert({
      client_id: data.id, type_event: 'creation',
      description: `Création de la fiche ${data.client_id}`
    })
    await reload()
    return data
  }, [reload])

  const update = useCallback(async (id, patch, ancienStatut) => {
    const enriched = enrichBeforeSave(patch)
    const { data, error } = await supabase
      .from('crm179_clients').update(enriched).eq('id', id).select().single()
    if (error) throw error
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
    if (error) throw error
    await reload()
  }, [reload])

  const duplicate = useCallback(async (id) => {
    const src = clients.find(c => c.id === id)
    if (!src) return
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
    // Supprime puis réinsère pour rester simple
    await supabase.from('crm179_contacts').delete().eq('client_id', clientUuid)
    const valid = contactsArr
      .filter(c => c && (c.nom || c.prenom || c.email || c.tel_mobile || c.tel_fixe))
      .map((c,i) => ({ ...c, id: undefined, client_id: clientUuid, ordre: i+1 }))
    if (valid.length) {
      const { error } = await supabase.from('crm179_contacts').insert(valid)
      if (error) throw error
    }
    await reload()
  }, [reload])

  return { clients, loading, reload, create, update, remove, duplicate, upsertContacts }
}
