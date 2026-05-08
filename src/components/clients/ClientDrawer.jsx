import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Save, Copy as CopyIcon, Trash2, FileDown, MapPin, Phone, Mail,
  Plus, Upload, Sparkles, AlertTriangle, X, FileText, ExternalLink, Eye, ListChecks,
  Activity, Building2, Map as MapIcon, Settings2, Wallet, ClipboardList, Pin
} from 'lucide-react'
import { Drawer } from '../ui/Modal'
import Button from '../ui/Button'
import Input, { Textarea } from '../ui/Input'
import Select from '../ui/Select'
import Toggle from '../ui/Toggle'
import StarRating from '../ui/StarRating'
import Badge from '../ui/Badge'
import ProgressBar, { ProgressCircle } from '../ui/ProgressBar'
import MiniMapChantier from './MiniMapChantier'
import { useClients } from '../../hooks/useClients'
import { useDocuments } from '../../hooks/useDocuments'
import { useTimeline } from '../../hooks/useTimeline'
import { useToast } from '../../contexts/ToastContext'
import { deptFromCP, geocodeAdresse, zoneClimatique } from '../../lib/geocoding'
import { CHECKLIST_ITEMS, calcVolumeCEE, isCoupDePouceX3, checklistProgress, estimerPrimeCEE } from '../../lib/cee'
import { exportClientPDF } from '../../lib/pdf'
import { fmtDate, fmtEUR, fmtNum, fmtRelative, cls } from '../../lib/utils'

const SECTIONS = [
  { id:'identification', label:'Identification',     icon: Building2 },
  { id:'contacts',       label:'Interlocuteurs',     icon: Phone },
  { id:'facturation',    label:'Adresse facturation',icon: Pin },
  { id:'chantier',       label:'Adresse chantier',   icon: MapIcon },
  { id:'technique',      label:'Caractéristiques',   icon: Settings2 },
  { id:'devis',          label:'Devis & financier',  icon: Wallet },
  { id:'statut',         label:'Statut & suivi',     icon: Activity },
  { id:'timeline',       label:'Timeline',           icon: Activity },
  { id:'documents',      label:'Documents',          icon: FileText },
  { id:'checklist',      label:'Checklist CEE',      icon: ClipboardList },
  { id:'notes',          label:'Notes',              icon: ListChecks }
]

const emptyAdresse = () => ({ rue:'', cp:'', ville:'', departement:'', pays:'France' })
const emptyContact = (i) => ({ ordre:i, civilite:'M.', nom:'', prenom:'', fonction:'', tel_fixe:'', tel_mobile:'', email:'' })

export default function ClientDrawer ({ open, onClose, client, paramsByCat, onCreated }) {
  const { create, update, remove, duplicate, upsertContacts } = useClients()
  const { events: timeline } = useTimeline(client?.id)
  const { docs, upload, remove: removeDoc, signedUrl } = useDocuments(client?.id)
  const toast = useToast()
  const isNew = !client?.id

  const [data, setData] = useState(null)
  const [active, setActive] = useState('identification')
  const [contacts, setContacts] = useState([emptyContact(1)])
  const [saving, setSaving] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  // Init / reset
  useEffect(() => {
    if (!open) return
    if (client?.id) {
      setData({ ...client,
        adresse_facturation: client.adresse_facturation || emptyAdresse(),
        adresse_chantier:    client.adresse_chantier    || emptyAdresse(),
        caracteristiques_techniques: client.caracteristiques_techniques || {},
        devis: client.devis || {},
        checklist_cee: client.checklist_cee || {}
      })
      setContacts((client.crm179_contacts?.length ? client.crm179_contacts : [emptyContact(1)])
        .map((c,i) => ({ ...emptyContact(i+1), ...c })))
    } else {
      setData({
        type_client:'', raison_sociale:'', siret:'', num_immatriculation_copro:'',
        nb_logements:'',
        adresse_facturation: emptyAdresse(),
        adresse_chantier:    emptyAdresse(),
        adresse_identique: true,
        zone_climatique:'',
        caracteristiques_techniques: { type_batiment:'', annee_construction:'', nb_logements_desservis:'',
          surface_chauffee:'', puissance_pac:'', usage:'', etas:'', note_dimensionnement: false },
        energie_remplacee:'',
        devis: {},
        statut_client: 'Prospect froid',
        statut_devis:  'À envoyer',
        date_ag_prevue: '', date_prochaine_action:'', type_prochaine_action:'',
        score_chaleur: 0,
        source_lead:'', apporteur_affaires:'', mandataire_cee:'',
        notes:'',
        checklist_cee: {}
      })
      setContacts([emptyContact(1)])
    }
    setActive('identification'); setConfirmDel(false)
  }, [open, client])

  // Helpers d'update
  const set    = (k,v)        => setData(d => ({ ...d, [k]: v }))
  const setIn  = (path, v)    => setData(d => {
    const next = { ...d }
    const segs = path.split('.')
    let cur = next
    for (let i=0; i<segs.length-1; i++) { cur[segs[i]] = { ...(cur[segs[i]]||{}) }; cur = cur[segs[i]] }
    cur[segs.at(-1)] = v
    return next
  })

  // Auto-département + zone climatique au changement de CP
  useEffect(() => {
    const cp = data?.adresse_chantier?.cp
    if (!cp) return
    const d = deptFromCP(cp)
    if (d && data.adresse_chantier.departement !== d) setIn('adresse_chantier.departement', d)
    const z = zoneClimatique(d)
    if (z && data.zone_climatique !== z) set('zone_climatique', z)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.adresse_chantier?.cp])

  // Coup de pouce x3 auto
  const cdp = isCoupDePouceX3(data?.energie_remplacee)
  useEffect(() => {
    if (data && data.coup_de_pouce_x3 !== cdp) set('coup_de_pouce_x3', cdp)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cdp])

  // Volume CEE auto
  const volume = useMemo(() => {
    if (!data) return 0
    return calcVolumeCEE({
      usage: data.caracteristiques_techniques?.usage,
      zone:  data.zone_climatique,
      nbLogements: data.nb_logements,
      energieRemplacee: data.energie_remplacee,
      etas: data.caracteristiques_techniques?.etas
    })
  }, [data])

  // Reste à charge auto
  const restCharge = useMemo(() => {
    const ttc   = Number(data?.devis?.montant_ttc || 0)
    const prime = Number(data?.devis?.prime_cee   || 0)
    return Math.max(0, Math.round(ttc - prime))
  }, [data?.devis?.montant_ttc, data?.devis?.prime_cee])

  // Estimation auto prime CEE si vide
  const primeAuto = useMemo(() => estimerPrimeCEE(volume), [volume])

  // Checklist progress
  const prog = useMemo(() => checklistProgress(data?.checklist_cee), [data?.checklist_cee])

  const geocode = async () => {
    if (!data?.adresse_chantier) return
    const r = await geocodeAdresse(data.adresse_chantier)
    if (r) {
      set('gps_lat', r.lat); set('gps_lng', r.lng)
      toast.success('Coordonnées GPS récupérées')
    } else toast.warn('Impossible de géocoder cette adresse')
  }

  const save = async () => {
    if (!data) return
    setSaving(true)
    try {
      const payload = {
        ...data,
        nb_logements: data.nb_logements ? Number(data.nb_logements) : null,
        adresse_chantier: data.adresse_identique ? data.adresse_facturation : data.adresse_chantier,
        devis: { ...data.devis, reste_charge: restCharge }
      }
      const ancien = client?.statut_client
      let saved
      if (isNew) saved = await create(payload)
      else       saved = await update(client.id, payload, ancien)
      if (saved) await upsertContacts(saved.id, contacts)
      toast.success(isNew ? 'Client créé ✨' : 'Modifications enregistrées')
      if (isNew && onCreated) onCreated(saved)
      else onClose()
    } catch (e) {
      console.error(e); toast.error(e.message || 'Erreur lors de la sauvegarde')
    } finally { setSaving(false) }
  }

  const onUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    for (const f of files) {
      try { await upload(f, 'Autre'); toast.success(f.name + ' téléversé') }
      catch (err) { toast.error('Erreur upload : ' + err.message) }
    }
    e.target.value = ''
  }

  const openDoc = async (path) => {
    try { window.open(await signedUrl(path), '_blank') }
    catch (e) { toast.error('Lien indisponible') }
  }

  const headerTitle = isNew
    ? 'Nouveau client'
    : (
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-xs text-ink-300">{client.client_id}</span>
          <span className="truncate">{data?.raison_sociale || '—'}</span>
          {data?.coup_de_pouce_x3 && <Badge color="#D4AF37" size="xs"><Sparkles className="w-3 h-3"/>x3</Badge>}
        </div>
      )

  const actionsFooter = (
    <>
      {!isNew && (
        <>
          <Button variant="ghost" icon={CopyIcon}
            onClick={() => duplicate(client.id).then(()=>{ toast.success('Client dupliqué'); onClose() })}>
            Dupliquer
          </Button>
          <Button variant="ghost" icon={FileDown} onClick={()=> exportClientPDF({ ...data, client_id: client.client_id }, contacts)}>
            Exporter PDF
          </Button>
          <Button variant="ghost" icon={MapPin} onClick={()=> {
            const a = data?.adresse_identique ? data?.adresse_facturation : data?.adresse_chantier
            const q = encodeURIComponent([a?.rue, a?.cp, a?.ville].filter(Boolean).join(' '))
            window.open('https://www.google.com/maps/search/?api=1&query=' + q, '_blank')
          }}>Google Maps</Button>
          <Button variant="danger" icon={Trash2}
            onClick={async ()=>{
              if (!confirmDel) { setConfirmDel(true); setTimeout(()=>setConfirmDel(false),3000); return }
              await remove(client.id); toast.success('Client supprimé'); onClose()
            }}>
            {confirmDel ? 'Confirmer ?' : 'Supprimer'}
          </Button>
        </>
      )}
      <Button onClick={save} loading={saving} icon={Save} variant="primary">
        {isNew ? 'Créer le client' : 'Enregistrer'}
      </Button>
    </>
  )

  const sectionAnchor = (id) => (
    <div id={id} className="relative -mt-4 pt-4">
      <SectionHeading id={id} />
    </div>
  )

  return (
    <Drawer open={open} onClose={onClose} title={headerTitle} footer={actionsFooter} width="980px">
      {!data ? null : (
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-5">
          {/* Nav latérale interne */}
          <nav className="hidden lg:flex flex-col gap-1 sticky top-2 self-start">
            {SECTIONS.map(s => (
              <a key={s.id} href={'#' + s.id}
                onClick={() => setActive(s.id)}
                className={cls('flex items-center gap-2 text-sm px-3 h-9 rounded-lg',
                  active === s.id ? 'bg-white/[.06] text-white' : 'text-ink-300 hover:text-white hover:bg-white/[.03]')}>
                <s.icon className="w-4 h-4"/>{s.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-6 min-w-0">
            {/* 1. Identification */}
            {sectionAnchor('identification')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select label="Type de client *" value={data.type_client||''}
                onChange={e=> set('type_client', e.target.value)}
                options={paramsByCat?.type_client || []}/>
              <Input  label="Raison sociale / Nom de la copro *" value={data.raison_sociale||''}
                onChange={e=> set('raison_sociale', e.target.value)} />
              <Input  label="N° SIRET" value={data.siret||''}
                onChange={e=> set('siret', e.target.value)} />
              <Input  label="Immatriculation registre des copros" value={data.num_immatriculation_copro||''}
                onChange={e=> set('num_immatriculation_copro', e.target.value)} />
              <Input  label="Nombre de lots / logements" type="number" value={data.nb_logements||''}
                onChange={e=> set('nb_logements', e.target.value)} />
            </div>

            {/* 2. Contacts */}
            {sectionAnchor('contacts')}
            <ContactsBlock contacts={contacts} setContacts={setContacts}/>

            {/* 3. Adresse facturation */}
            {sectionAnchor('facturation')}
            <AddressBlock value={data.adresse_facturation} onChange={v=> set('adresse_facturation', v)} />

            {/* 4. Adresse chantier */}
            {sectionAnchor('chantier')}
            <div className="card p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Toggle label="Adresse chantier identique au siège ?"
                  checked={!!data.adresse_identique}
                  onChange={v => set('adresse_identique', v)} />
                <Button size="sm" variant="ghost" icon={MapPin} onClick={geocode}>Géocoder</Button>
              </div>
              {!data.adresse_identique && (
                <AddressBlock embedded value={data.adresse_chantier} onChange={v=> set('adresse_chantier', v)} />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input label="Département (auto)" value={data.adresse_chantier?.departement||''} readOnly />
                <Select label="Zone climatique" value={data.zone_climatique||''}
                  onChange={e=> set('zone_climatique', e.target.value)}
                  options={paramsByCat?.zone_climatique || []}/>
                <Input label="GPS" value={data.gps_lat ? `${data.gps_lat.toFixed?.(4) || data.gps_lat}, ${data.gps_lng?.toFixed?.(4) || data.gps_lng}` : ''} readOnly />
              </div>
              <MiniMapChantier
                adresse={data.adresse_identique ? data.adresse_facturation : data.adresse_chantier}
                lat={data.gps_lat} lng={data.gps_lng} />
            </div>

            {/* 5. Caractéristiques techniques */}
            {sectionAnchor('technique')}
            <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select label="Type bâtiment" value={data.caracteristiques_techniques?.type_batiment||''}
                onChange={e=> setIn('caracteristiques_techniques.type_batiment', e.target.value)}
                options={['Copro existante','Logement social','Mixte','Autre']}/>
              <Input  label="Année construction" type="number"
                value={data.caracteristiques_techniques?.annee_construction||''}
                onChange={e=> setIn('caracteristiques_techniques.annee_construction', e.target.value)} />
              <Input  label="Nb logements desservis par la PAC" type="number"
                value={data.caracteristiques_techniques?.nb_logements_desservis||''}
                onChange={e=> setIn('caracteristiques_techniques.nb_logements_desservis', e.target.value)} />
              <Input  label="Surface chauffée (m²)" type="number"
                value={data.caracteristiques_techniques?.surface_chauffee||''}
                onChange={e=> setIn('caracteristiques_techniques.surface_chauffee', e.target.value)} />
              <Select label="Énergie remplacée" value={data.energie_remplacee||''}
                onChange={e=> set('energie_remplacee', e.target.value)}
                options={paramsByCat?.energie_remplacee || []}/>
              <div className="flex flex-col gap-1.5">
                <Input label="Puissance PAC (kW)" type="number"
                  value={data.caracteristiques_techniques?.puissance_pac||''}
                  onChange={e=> setIn('caracteristiques_techniques.puissance_pac', e.target.value)} />
                {Number(data.caracteristiques_techniques?.puissance_pac) > 400 && (
                  <span className="text-xs text-amber-300 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/>Puissance &gt; 400 kW : vérifier le dimensionnement.</span>
                )}
              </div>
              <Select label="Usage" value={data.caracteristiques_techniques?.usage||''}
                onChange={e=> setIn('caracteristiques_techniques.usage', e.target.value)}
                options={['Chauffage seul','Chauffage + ECS']}/>
              <Input  label="ETAS prévu (%)" type="number"
                value={data.caracteristiques_techniques?.etas||''}
                onChange={e=> setIn('caracteristiques_techniques.etas', e.target.value)} />
              <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                <Toggle label="Note de dimensionnement reçue"
                  checked={!!data.caracteristiques_techniques?.note_dimensionnement}
                  onChange={v => setIn('caracteristiques_techniques.note_dimensionnement', v)} />
                {cdp && <Badge color="#D4AF37" size="sm"><Sparkles className="w-3 h-3"/> Coup de Pouce x3 éligible</Badge>}
                <span className="ml-auto text-xs text-ink-300">
                  Volume CEE estimé&nbsp;: <span className="font-mono text-ink-100">{fmtNum(volume)}</span> kWh cumac
                </span>
              </div>
            </div>

            {/* 6. Devis */}
            {sectionAnchor('devis')}
            <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="N° devis"  value={data.devis?.numero||''}
                onChange={e=> setIn('devis.numero', e.target.value)} />
              <Input label="Date d'envoi" type="date" value={data.devis?.date_envoi||''}
                onChange={e=> setIn('devis.date_envoi', e.target.value)} />
              <Input label="Montant HT (€)"  type="number" value={data.devis?.montant_ht||''}
                onChange={e=> setIn('devis.montant_ht', e.target.value)} />
              <Input label="Montant TTC (€)" type="number" value={data.devis?.montant_ttc||''}
                onChange={e=> setIn('devis.montant_ttc', e.target.value)} />
              <Select label="Statut devis" value={data.statut_devis||''}
                onChange={e=> set('statut_devis', e.target.value)}
                options={paramsByCat?.statut_devis || []}/>
              <Input label="Date de signature" type="date" value={data.devis?.date_signature||''}
                onChange={e=> setIn('devis.date_signature', e.target.value)} />
              <Input label="Acompte versé (€)" type="number" value={data.devis?.acompte||''}
                onChange={e=> setIn('devis.acompte', e.target.value)} />
              <div className="flex flex-col gap-1.5">
                <Input label="Estimation prime CEE (€)" type="number"
                  value={data.devis?.prime_cee || ''}
                  onChange={e=> setIn('devis.prime_cee', e.target.value)}
                  hint={`Estimation auto : ${fmtEUR(primeAuto)} (sur ${fmtNum(volume)} kWh)`} />
              </div>
              <div className="sm:col-span-2 rounded-xl border border-white/[.06] bg-white/[.02] p-3 flex items-center gap-3">
                <span className="text-sm text-ink-300">Reste à charge (auto)</span>
                <span className="ml-auto font-mono text-lg">{fmtEUR(restCharge)}</span>
              </div>
            </div>

            {/* 7. Statut & suivi */}
            {sectionAnchor('statut')}
            <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select label="Statut client" value={data.statut_client||''}
                onChange={e=> set('statut_client', e.target.value)}
                options={paramsByCat?.statut_client || []}/>
              <Input label="Date AG prévue" type="date" value={data.date_ag_prevue||''}
                onChange={e=> set('date_ag_prevue', e.target.value)} />
              <Select label="Type prochaine action" value={data.type_prochaine_action||''}
                onChange={e=> set('type_prochaine_action', e.target.value)}
                options={paramsByCat?.type_action || []}/>
              <Input label="Date prochaine action" type="date" value={data.date_prochaine_action||''}
                onChange={e=> set('date_prochaine_action', e.target.value)} />
              <div className="flex items-center gap-3">
                <span className="label">Score chaleur</span>
                <StarRating value={data.score_chaleur||0} onChange={v=> set('score_chaleur', v)} />
              </div>
              <Select label="Source du lead" value={data.source_lead||''}
                onChange={e=> set('source_lead', e.target.value)}
                options={paramsByCat?.source_lead || []}/>
              <Input  label="Apporteur d'affaires" value={data.apporteur_affaires||''}
                onChange={e=> set('apporteur_affaires', e.target.value)} />
              <Select label="Mandataire CEE" value={data.mandataire_cee||''}
                onChange={e=> set('mandataire_cee', e.target.value)}
                options={paramsByCat?.mandataire_cee || []}/>
            </div>

            {/* 8. Timeline */}
            {sectionAnchor('timeline')}
            <div className="card p-4">
              {!isNew && timeline.length > 0 ? (
                <ol className="relative border-l border-white/[.08] ml-2 flex flex-col gap-3">
                  {timeline.map(t => (
                    <li key={t.id} className="ml-4 relative">
                      <span className="absolute -left-[26px] top-1.5 w-3 h-3 rounded-full bg-gradient-primary"/>
                      <div className="text-sm">{t.description || t.type_event}</div>
                      <div className="text-xs text-ink-300 flex items-center gap-2">
                        <span>{fmtRelative(t.created_at)}</span>
                        {t.ancien_statut && <span>· {t.ancien_statut} → {t.nouveau_statut}</span>}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : <div className="text-sm text-ink-300">{isNew ? 'La timeline apparaîtra après création.' : 'Aucun évènement.'}</div>}
            </div>

            {/* 9. Documents */}
            {sectionAnchor('documents')}
            <div className="card p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="file" multiple className="hidden" onChange={onUpload} disabled={isNew}/>
                  <span className={cls('inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-white/[.08] bg-white/[.04] hover:bg-white/[.06] text-sm',
                    isNew && 'opacity-50 cursor-not-allowed')}>
                    <Upload className="w-4 h-4"/>{isNew ? 'Sauvegarder le client d\'abord' : 'Téléverser un document'}
                  </span>
                </label>
                <span className="text-xs text-ink-300">{docs.length} fichier(s)</span>
              </div>
              {docs.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {docs.map(d => (
                    <li key={d.id} className="flex items-center gap-3 rounded-xl bg-white/[.03] border border-white/[.05] px-3 py-2">
                      <FileText className="w-4 h-4 text-ink-300"/>
                      <span className="text-sm flex-1 truncate">{d.nom_fichier}</span>
                      <span className="text-xs text-ink-300">{Math.round((d.taille||0)/1024)} Ko · {fmtRelative(d.created_at)}</span>
                      <button className="text-ink-300 hover:text-white p-1.5 rounded-lg hover:bg-white/5" onClick={()=> openDoc(d.url_storage)}>
                        <Eye className="w-4 h-4"/>
                      </button>
                      <button className="text-ink-300 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5" onClick={()=> removeDoc(d)}>
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 10. Checklist */}
            {sectionAnchor('checklist')}
            <div className="card p-4">
              <div className="flex items-center gap-3 mb-3">
                <ProgressCircle value={prog.pct} size={56} stroke={6} sub="conf." />
                <div className="flex-1">
                  <div className="font-display text-base">Conformité CEE</div>
                  <div className="text-xs text-ink-300">{prog.done}/{prog.total} items validés</div>
                </div>
                <Badge color="#D4AF37" size="sm">{fmtNum(volume)} kWh cumac</Badge>
              </div>
              <ProgressBar value={prog.pct} className="mb-3"/>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CHECKLIST_ITEMS.map(it => {
                  const ok = !!data.checklist_cee?.[it.key]
                  return (
                    <button key={it.key} type="button"
                      onClick={() => setIn(`checklist_cee.${it.key}`, !ok)}
                      className={cls('flex items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition-colors',
                        ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100' : 'bg-white/[.03] border-white/[.06] hover:bg-white/[.05]')}>
                      <span className={cls('w-4 h-4 rounded grid place-items-center text-[11px]',
                        ok ? 'bg-emerald-500 text-white' : 'border border-white/20')}>
                        {ok ? '✓' : ''}
                      </span>
                      {it.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 11. Notes */}
            {sectionAnchor('notes')}
            <Textarea label="Notes libres" rows={6}
              value={data.notes||''} onChange={e=> set('notes', e.target.value)}
              placeholder="Contexte, points évoqués en RDV, conditions négociées…" />
          </div>
        </div>
      )}
    </Drawer>
  )
}

function SectionHeading ({ id }) {
  const s = SECTIONS.find(x => x.id === id)
  if (!s) return null
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-7 h-7 rounded-lg bg-gradient-primary grid place-items-center"><s.icon className="w-4 h-4 text-white"/></div>
      <h3 className="font-display text-lg">{s.label}</h3>
    </div>
  )
}

function ContactsBlock ({ contacts, setContacts }) {
  const update = (i, k, v) => setContacts(arr => arr.map((c,idx) => idx===i ? { ...c, [k]: v } : c))
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="label">Jusqu'à 3 interlocuteurs</span>
        {contacts.length < 3 && (
          <Button size="xs" variant="ghost" icon={Plus}
            onClick={()=> setContacts(arr => [...arr, emptyContact(arr.length+1)])}>Ajouter</Button>
        )}
      </div>
      {contacts.map((c, i) => (
        <div key={i} className="rounded-xl border border-white/[.06] bg-white/[.02] p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-wider text-ink-300">Contact #{i+1}</div>
            {contacts.length > 1 && (
              <button onClick={() => setContacts(arr => arr.filter((_,idx)=> idx!==i))}
                className="text-ink-300 hover:text-rose-400 p-1 rounded">
                <X className="w-4 h-4"/>
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Select className="!h-9" value={c.civilite||''} onChange={e=> update(i,'civilite', e.target.value)} options={['M.','Mme']} allowEmpty={false}/>
            <Input  className="!h-9" placeholder="Nom"     value={c.nom||''}    onChange={e=> update(i,'nom', e.target.value)}/>
            <Input  className="!h-9" placeholder="Prénom"  value={c.prenom||''} onChange={e=> update(i,'prenom', e.target.value)}/>
            <Input  className="!h-9" placeholder="Fonction" value={c.fonction||''} onChange={e=> update(i,'fonction', e.target.value)}/>
            <Input  className="!h-9" placeholder="Tél fixe"   value={c.tel_fixe||''}   onChange={e=> update(i,'tel_fixe', e.target.value)}/>
            <Input  className="!h-9" placeholder="Tél mobile" value={c.tel_mobile||''} onChange={e=> update(i,'tel_mobile', e.target.value)}/>
            <Input  className="!h-9 col-span-2" placeholder="email@…" type="email" value={c.email||''} onChange={e=> update(i,'email', e.target.value)}/>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {c.tel_mobile && (
              <a href={'tel:'+c.tel_mobile} className="inline-flex items-center gap-1 text-xs text-ink-200 hover:text-white bg-white/[.04] px-2 py-1 rounded-md"><Phone className="w-3 h-3"/>Appeler</a>
            )}
            {c.email && (
              <a href={'mailto:'+c.email} className="inline-flex items-center gap-1 text-xs text-ink-200 hover:text-white bg-white/[.04] px-2 py-1 rounded-md"><Mail className="w-3 h-3"/>Email</a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function AddressBlock ({ value, onChange, embedded=false }) {
  const v = value || emptyAdresse()
  const set = (k,val) => onChange({ ...v, [k]: val })
  const Wrap = embedded ? 'div' : ({children}) => <div className="card p-4">{children}</div>
  return (
    <Wrap>
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
        <Input wrapperClass="sm:col-span-6" label="Adresse" value={v.rue||''}    onChange={e=> set('rue', e.target.value)}/>
        <Input wrapperClass="sm:col-span-1" label="CP"      value={v.cp||''}     onChange={e=> set('cp', e.target.value)}/>
        <Input wrapperClass="sm:col-span-3" label="Ville"   value={v.ville||''}  onChange={e=> set('ville', e.target.value)}/>
        <Input wrapperClass="sm:col-span-2" label="Pays"    value={v.pays||'France'} onChange={e=> set('pays', e.target.value)}/>
      </div>
    </Wrap>
  )
}
