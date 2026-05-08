/**
 * Géocodage gratuit via Nominatim (OpenStreetMap).
 * Pas de clé API. Throttle natif par requête.
 */
export async function geocodeAdresse (adr) {
  if (!adr) return null
  const q = [adr.rue, adr.cp, adr.ville, adr.pays || 'France'].filter(Boolean).join(', ')
  if (!q.trim()) return null
  try {
    const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q)
    const r = await fetch(url, { headers: { 'Accept-Language': 'fr' } })
    if (!r.ok) return null
    const j = await r.json()
    if (!j?.length) return null
    return { lat: parseFloat(j[0].lat), lng: parseFloat(j[0].lon), display: j[0].display_name }
  } catch { return null }
}

/**
 * Département depuis le code postal français.
 * Gère Corse (20) → 2A/2B et DOM (97x).
 */
export function deptFromCP (cp) {
  if (!cp) return null
  const s = String(cp).trim()
  if (s.startsWith('20')) {
    const n = parseInt(s,10)
    if (n >= 20000 && n <= 20190) return '2A'
    if (n >= 20200 && n <= 20620) return '2B'
  }
  if (s.startsWith('97') || s.startsWith('98')) return s.slice(0,3)
  return s.slice(0,2)
}

/**
 * Zone climatique BAR-TH-179 (RT2012) déduite du département.
 * Source : annexes BAR-TH-179. Approximation pratique.
 */
const ZONE_H1 = new Set([
  '01','02','03','08','10','21','25','39','51','52','54','55','57','58','59','60','62','67','68','70','71','73','74','75','77','78','80','88','89','90','91','92','93','94','95'
])
const ZONE_H3 = new Set(['06','11','13','30','34','66','83','84','2A','2B'])

export function zoneClimatique (dept) {
  if (!dept) return null
  const d = String(dept)
  if (ZONE_H1.has(d)) return 'H1'
  if (ZONE_H3.has(d)) return 'H3'
  return 'H2'
}
