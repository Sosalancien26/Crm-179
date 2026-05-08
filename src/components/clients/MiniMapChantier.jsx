import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { geocodeAdresse } from '../../lib/geocoding'

export default function MiniMapChantier ({ adresse, lat, lng }) {
  const [pos, setPos] = useState(lat && lng ? [Number(lat), Number(lng)] : null)
  useEffect(() => {
    if (lat && lng) { setPos([Number(lat), Number(lng)]); return }
    let alive = true
    if (adresse?.cp || adresse?.ville) {
      geocodeAdresse(adresse).then(g => { if (alive && g) setPos([g.lat, g.lng]) })
    }
    return () => { alive = false }
  }, [adresse, lat, lng])

  if (!pos) {
    return (
      <div className="rounded-xl bg-white/[.03] border border-white/[.06] h-44 grid place-items-center text-xs text-ink-300">
        Saisis une adresse de chantier pour afficher la carte.
      </div>
    )
  }
  return (
    <div className="rounded-xl overflow-hidden border border-white/[.06] h-56">
      <MapContainer center={pos} zoom={14} scrollWheelZoom={false} className="h-full">
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; OSM &copy; CartoDB' />
        <CircleMarker center={pos} radius={11}
          pathOptions={{ color:'#C5A572', weight:2, fillColor:'#C5A572', fillOpacity:.6 }}>
          <Tooltip permanent direction="top" offset={[0,-4]}>
            <span className="text-[11px]">📍 Chantier</span>
          </Tooltip>
        </CircleMarker>
      </MapContainer>
    </div>
  )
}
