import { useNavigate } from 'react-router-dom'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { AlertCircle, Bell, Calendar, Hammer } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'

export default function AlertsPanel ({ clients=[] }) {
  const nav = useNavigate()
  const today = new Date()

  // Devis envoyés > 30j
  const stale = clients.filter(c => {
    if (c.statut_devis !== 'Envoyé' || !c.devis?.date_envoi) return false
    return differenceInCalendarDays(today, parseISO(c.devis.date_envoi)) > 30
  })
  const nrp = clients.filter(c => c.statut_client === 'NRP' || /Relance/.test(c.statut_client))
  const ag  = clients.filter(c => {
    if (!c.date_ag_prevue) return false
    const d = differenceInCalendarDays(parseISO(c.date_ag_prevue), today)
    return d >= 0 && d <= 15
  })
  const chantiers = clients.filter(c => c.statut_client === 'Signé chantier à planifier')

  const items = [
    { color:'#EF4444', icon: AlertCircle, label: 'Devis > 30j sans réponse', list: stale },
    { color:'#F59E0B', icon: Bell,        label: 'NRP / Relances',           list: nrp },
    { color:'#FBBF24', icon: Calendar,    label: 'AG dans 15 jours',         list: ag },
    { color:'#10B981', icon: Hammer,      label: 'Chantiers à planifier',   list: chantiers }
  ]

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-base">Alertes intelligentes</h3>
        <span className="text-xs text-ink-300">{items.reduce((a,b)=>a+b.list.length,0)} en cours</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(it => (
          <div key={it.label}
            className="rounded-xl border border-white/[.06] bg-white/[.02] p-3 hover:bg-white/[.04] transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: it.color+'22', color: it.color }}>
                <it.icon className="w-4 h-4"/>
              </span>
              <span className="text-sm">{it.label}</span>
              <Badge color={it.color} size="xs" className="ml-auto">{it.list.length}</Badge>
            </div>
            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
              {it.list.slice(0,4).map(c => (
                <button key={c.id} onClick={()=> nav('/clients?id='+c.id)}
                  className="text-xs text-ink-200 hover:text-white text-left truncate">
                  · {c.client_id} — {c.raison_sociale || '—'}
                </button>
              ))}
              {it.list.length === 0 && <div className="text-xs text-ink-300/70 italic">Rien à signaler ✨</div>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
