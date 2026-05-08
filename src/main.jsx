import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Fix marqueurs Leaflet (icônes par défaut cassées avec bundlers)
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Migration : pour la v1.1 (redesign clair), on remet light mode pour
// tous les utilisateurs qui avaient enregistré 'dark' précédemment.
try {
  if (!localStorage.getItem('crm179_theme_v1_1_reset')) {
    localStorage.setItem('crm179_theme', 'light')
    localStorage.setItem('crm179_theme_v1_1_reset', '1')
  }
} catch {}

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
