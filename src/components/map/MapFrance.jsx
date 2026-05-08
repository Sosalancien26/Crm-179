import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, LayersControl, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { motion } from 'framer-motion'
import { Filter, Layers, MapPin, Sparkles, ExternalLink } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Toggle from '../ui/Toggle'
import Select from '../ui/Select'
import { fmtEUR, hexToRgba } from '../../lib/utils'
import { geocodeAdresse } from '../../lib/geocoding'
import { DEPT_CENTROIDS } from '../../lib/departements'

const FRANCE_CENTER = [46.6, 2.5]

export default function MapFrance ({ clients, byCat, onOpenClient }) {
  const [filters, setFilters] = useState({ statut:'', type:'', cdpx3:false })
  const [heatmap, setHeatmap] = useState(false)
  const [enriched, setEnriched] = useState({})

  // Géocoder à la volée les clients sans GPS
  useEffect(() => {
    let cancel = false
    ;(async () => {
      for (const c of clients) {
        if (cancel) break
        if (c.gps_lat && c.gps_lng) continue
        if (enriched[c.id]) continue
        const adr = c.adresse_identique ? c.adresse_facturation : c.adresse_chantier
        if (!adr?.cp && !adr?.ville) continue
        const dept = adr?.departement
        if (DEPT_CENTROIDS[dept]) {
          const [lat, lng] = DEPT_CENTROIDS[dept]
          setEnriched(e => ({ ...e, [c.id]: { lat, lng } }))
        }
      }
    })()
    return () => { cancel = true }
  }, [clients]) // eslint-disable-line react-hooks/exhaustive-deps

  const points = useMemo(() => {
    return clients.map(c => {
      const lat = c.gps_lat ?? enriched[c.id]?.lat
      const lng = c.gps_lng ?? enriched[c.id]?.lng
      if (lat == null || lng == null) return null
      if (filters.statut && c.statut_client !== filters.statut) return null
      if (filters.type   && c.type_client   !== filters.type)   return null
      if (filters.cdpx3  && !c.coup_de_pouce_x3) return null
      const color = byCat('statut_client').find(s => s.valeur === c.statut_client)?.couleur || '#C5A572'
      return { id: c.id, lat:Number(lat), lng:Number(lng), color, c }
    }).filter(Boolean)
  }, [clients, filters, byCat, enriched])

  const stats = useMemo(() => ({
    total: points.length,
    montant: points.reduce((a,b)=> a + Number(b.c.devis?.montant_ttc||0), 0)
  }), [points])

  return (
    <div className="relative h-[calc(100vh-4rem)]">
      <MapContainer center={FRANCE_CENTER} zoom={6} className="absolute inset-0">
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; OSM &copy; CartoDB' />

        {/* Heatmap visuelle simulée par cercles flous additionnés */}
        {heatmap && points.map(p => (
          <CircleMarker key={'h-'+p.id} center={[p.lat, p.lng]} radius={28}
            pathOptions={{ stroke:false, fillColor:'#C5A572', fillOpacity:.10 }}/>
        ))}

        {points.map(p => (
          <CircleMarker key={p.id} center={[p.lat, p.lng]} radius={9}
            pathOptions={{ color:'#0A0A0F', weight:2, fillColor:p.color, fillOpacity:.95 }}>
            <Popup>
              <div className="flex flex-col gap-1 min-w-[220px]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] opacity-60">{p.c.client_id}</span>
                  {p.c.coup_de_pouce_x3 && <Badge color="#D4AF37" size="xs"><Sparkles className="w-3 h-3"/>x3</Badge>}
                </div>
                <div className="font-semibold">{p.c.raison_sociale || '—'}</div>
                <div className="text-xs opacity-80">{p.c.type_client} · {p.c.statut_client}</div>
                <div className="text-xs">{p.c.adresse_chantier?.cp} {p.c.adresse_chantier?.ville}</div>
                <div className="text-sm font-mono">{p.c.devis?.montant_ttc ? fmtEUR(p.c.devis.montant_ttc) : '—'}</div>
                <button onClick={() => onOpenClient?.(p.c)}
                  className="mt-1 text-xs inline-flex items-center gap-1 text-brand-violet hover:underline">
                  Ouvrir la fiche <ExternalLink className="w-3 h-3"/>
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Panneau filtres */}
      <motion.div
        initial={{ x: -320, opacity:0 }} animate={{ x:0, opacity:1 }}
        className="absolute top-4 left-4 w-[300px] space-y-3 z-[400]">
        <Card className="!p-3">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-ink-300"/>
            <h3 className="font-display text-sm">Filtres</h3>
            <Badge size="xs" className="ml-auto">{stats.total} pts</Badge>
          </div>
          <div className="flex flex-col gap-2">
            <Select label="Statut client" value={filters.statut}
              onChange={e=> setFilters(f=> ({...f, statut: e.target.value}))}
              options={byCat('statut_client').map(s => s.valeur)}/>
            <Select label="Type client" value={filters.type}
              onChange={e=> setFilters(f=> ({...f, type: e.target.value}))}
              options={byCat('type_client').map(s => s.valeur)}/>
            <div className="flex items-center justify-between">
              <Toggle label="Coup de Pouce x3" checked={filters.cdpx3} onChange={v=> setFilters(f=> ({...f, cdpx3:v}))}/>
              <Toggle label="Heatmap" checked={heatmap} onChange={setHeatmap}/>
            </div>
          </div>
        </Card>
        <Card className="!p-3 text-xs">
          <div className="font-display text-sm mb-1">Légende</div>
          <div className="grid grid-cols-2 gap-1">
            {byCat('statut_client').slice(0,12).map(s => (
              <div key={s.valeur} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background:s.couleur }}/>
                <span className="truncate">{s.valeur}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="!p-3 text-xs">
          <div>Total estimé pipeline : <span className="font-mono">{fmtEUR(stats.montant)}</span></div>
        </Card>
      </motion.div>
    </div>
  )
}
