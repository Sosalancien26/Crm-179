import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Download, Sparkles } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Toggle from '../components/ui/Toggle'
import Skeleton from '../components/ui/Skeleton'
import Card from '../components/ui/Card'
import ClientList from '../components/clients/ClientList'
import ClientDrawer from '../components/clients/ClientDrawer'
import { useClients } from '../hooks/useClients'
import { useParametres } from '../hooks/useParametres'
import { exportCSV } from '../lib/utils'

export default function ClientsPage () {
  const { clients, loading } = useClients()
  const { byCat } = useParametres()
  const [params, setParams] = useSearchParams()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState(null) // null = new
  const [q, setQ] = useState('')
  const [filters, setFilters] = useState({
    type:'', statut:'', dept:'', energie:'', cdpx3:false
  })
  const [showFilters, setShowFilters] = useState(false)
  const [limit, setLimit] = useState(40)

  // Index params/colors pour la liste
  const paramColors = useMemo(() => {
    const out = { statut_client: {}, type_client: {} }
    ;(byCat('statut_client')||[]).forEach(p => out.statut_client[p.valeur] = p.couleur)
    ;(byCat('type_client')   ||[]).forEach(p => out.type_client[p.valeur]   = p.couleur)
    return out
  }, [byCat])

  // paramsByCat groupé pour le drawer (tableau de strings)
  const paramsByCat = useMemo(() => {
    const o = {}
    Object.keys(byCat ? {} : {})  // eslint-disable-line
    ;[
      'type_client','statut_client','statut_devis','type_action','energie_remplacee',
      'mandataire_cee','source_lead','zone_climatique','type_document'
    ].forEach(c => o[c] = (byCat(c)||[]).map(p => p.valeur))
    return o
  }, [byCat])

  // Filtrage
  const filtered = useMemo(() => {
    const Q = q.trim().toLowerCase()
    return clients.filter(c => {
      if (filters.type    && c.type_client       !== filters.type)    return false
      if (filters.statut  && c.statut_client     !== filters.statut)  return false
      if (filters.energie && c.energie_remplacee !== filters.energie) return false
      if (filters.cdpx3   && !c.coup_de_pouce_x3) return false
      if (filters.dept) {
        const d = c.adresse_chantier?.departement || c.adresse_facturation?.departement
        if (d !== filters.dept) return false
      }
      if (Q) {
        const hay = [
          c.client_id, c.raison_sociale, c.siret, c.num_immatriculation_copro,
          c.adresse_chantier?.ville, c.adresse_facturation?.ville,
          c.adresse_chantier?.cp, c.statut_client, c.type_client,
          ...(c.crm179_contacts||[]).flatMap(x => [x.nom,x.prenom,x.email,x.tel_mobile])
        ].filter(Boolean).join(' ').toLowerCase()
        if (!hay.includes(Q)) return false
      }
      return true
    })
  }, [clients, q, filters])

  // Ouverture par ?id= ou ?new=1
  useEffect(() => {
    const id = params.get('id')
    const isNew = params.get('new')
    if (isNew) { setEditing(null); setDrawerOpen(true) }
    else if (id) {
      const c = clients.find(x => x.id === id)
      if (c) { setEditing(c); setDrawerOpen(true) }
    }
  }, [params, clients])

  const closeDrawer = () => {
    setDrawerOpen(false); setEditing(null)
    if (params.get('id') || params.get('new')) {
      const np = new URLSearchParams(params); np.delete('id'); np.delete('new'); setParams(np, { replace: true })
    }
  }

  // Scroll infini léger : on étend le `limit` quand on touche le bas
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight - 200
      if (window.scrollY > max && limit < filtered.length) setLimit(l => l + 40)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [limit, filtered.length])

  const visibles = filtered.slice(0, limit)

  const handleExport = () => {
    exportCSV(filtered.map(c => ({
      client_id: c.client_id,
      raison_sociale: c.raison_sociale,
      type_client:    c.type_client,
      siret:          c.siret,
      ville_chantier: c.adresse_chantier?.ville,
      cp_chantier:    c.adresse_chantier?.cp,
      departement:    c.adresse_chantier?.departement,
      zone_climatique:c.zone_climatique,
      statut:         c.statut_client,
      statut_devis:   c.statut_devis,
      montant_ht:     c.devis?.montant_ht,
      montant_ttc:    c.devis?.montant_ttc,
      prime_cee:      c.devis?.prime_cee,
      reste_a_charge: c.devis?.reste_charge,
      coup_de_pouce_x3: c.coup_de_pouce_x3,
      volume_cee_kwh: c.volume_cee_estime,
      score:          c.score_chaleur,
      created_at:     c.created_at
    })), `clients-crm179-${new Date().toISOString().slice(0,10)}.csv`)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[.18em] text-ink-300">Annuaire</div>
          <h1 className="font-display text-4xl md:text-5xl text-deep tracking-tight">Clients</h1>
          <p className="text-sm text-ink-300 mt-1">{filtered.length} résultats {q && `pour « ${q} »`}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" icon={Download} onClick={handleExport}>Exporter CSV</Button>
          <Button icon={Plus} onClick={()=>{ setEditing(null); setDrawerOpen(true) }}>Nouveau client</Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="!p-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"/>
            <input value={q} onChange={e=> setQ(e.target.value)}
              placeholder="Rechercher par nom, ID, ville, SIRET, contact…"
              className="input-base !h-10 pl-9"/>
          </div>
          <Button variant="ghost" icon={Filter} onClick={() => setShowFilters(s => !s)}>
            Filtres
          </Button>
        </div>
        {showFilters && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3 overflow-hidden">
            <Select label="Type"    value={filters.type}    onChange={e=> setFilters(f=> ({...f, type:e.target.value}))}    options={byCat('type_client').map(p=>p.valeur)}/>
            <Select label="Statut"  value={filters.statut}  onChange={e=> setFilters(f=> ({...f, statut:e.target.value}))}  options={byCat('statut_client').map(p=>p.valeur)}/>
            <Input  label="Département" value={filters.dept} onChange={e=> setFilters(f=> ({...f, dept:e.target.value}))} placeholder="ex 75"/>
            <Select label="Énergie" value={filters.energie} onChange={e=> setFilters(f=> ({...f, energie:e.target.value}))} options={byCat('energie_remplacee').map(p=>p.valeur)}/>
            <div className="flex items-end">
              <Toggle label="Coup de Pouce x3 uniquement" checked={filters.cdpx3} onChange={v=> setFilters(f=> ({...f, cdpx3:v}))} />
              {filters.cdpx3 && <Sparkles className="w-4 h-4 text-amber-300 ml-2"/>}
            </div>
          </motion.div>
        )}
      </Card>

      {/* List */}
      {loading
        ? <div className="space-y-2">
            {Array.from({length:8}).map((_,i)=> <Skeleton key={i} className="h-14 w-full"/>)}
          </div>
        : <ClientList clients={visibles} onOpen={(c)=>{ setEditing(c); setDrawerOpen(true) }} paramColors={paramColors}/>
      }
      {visibles.length < filtered.length && (
        <div className="text-center text-xs text-ink-300 mt-3">
          Affichage {visibles.length}/{filtered.length} — fais défiler pour charger plus.
        </div>
      )}

      <ClientDrawer
        open={drawerOpen} onClose={closeDrawer}
        client={editing}
        paramsByCat={paramsByCat}
        onCreated={(c) => { setEditing(c) }}
      />
    </div>
  )
}
