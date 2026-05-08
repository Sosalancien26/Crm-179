import { useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import Card from '../ui/Card'
import { DEPT_CENTROIDS, DEPT_NAMES } from '../../lib/departements'

export default function MiniMapDensity ({ clients=[] }) {
  const data = useMemo(() => {
    const counts = {}
    clients.forEach(c => {
      const d = c.adresse_chantier?.departement || c.adresse_facturation?.departement
      if (!d) return
      counts[d] = (counts[d] || 0) + 1
    })
    const max = Math.max(1, ...Object.values(counts))
    return Object.entries(counts).map(([dept, count]) => {
      const ll = DEPT_CENTROIDS[dept]
      if (!ll) return null
      return { dept, count, lat: ll[0], lng: ll[1], r: 5 + (count/max)*16 }
    }).filter(Boolean)
  }, [clients])

  return (
    <Card className="h-[320px] !p-0 overflow-hidden">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h3 className="font-display text-base">Densité par département</h3>
        <span className="text-xs text-ink-300">{data.length} dépts</span>
      </div>
      <MapContainer center={[46.6, 2.5]} zoom={5} scrollWheelZoom={false} dragging={false}
        zoomControl={false} doubleClickZoom={false} className="h-[260px] rounded-b-2xl">
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; OSM &copy; CartoDB' />
        {data.map(d => (
          <CircleMarker key={d.dept} center={[d.lat, d.lng]} radius={d.r}
            pathOptions={{ color:'#7C3AED', weight:1, fillColor:'#7C3AED', fillOpacity: .5 }}>
          </CircleMarker>
        ))}
      </MapContainer>
    </Card>
  )
}
