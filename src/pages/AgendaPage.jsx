import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths,
  isSameMonth, isSameDay, format, parseISO, differenceInCalendarDays, isPast
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Sparkles, FileText, AlertCircle } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { useClients } from '../hooks/useClients'
import { fmtDate, cls } from '../lib/utils'

function eventsFromClients (clients) {
  const events = []
  clients.forEach(c => {
    if (c.date_ag_prevue) {
      events.push({
        id: c.id+'-ag', clientId: c.id, date: parseISO(c.date_ag_prevue),
        kind: 'AG', title: c.raison_sociale || c.client_id, color: '#A78652', icon: CalIcon,
        sub: 'AG prévue'
      })
    }
    if (c.date_prochaine_action) {
      events.push({
        id: c.id+'-act', clientId: c.id, date: parseISO(c.date_prochaine_action),
        kind: 'Action', title: c.raison_sociale || c.client_id,
        color: '#535B66', icon: FileText, sub: c.type_prochaine_action || 'Action'
      })
    }
    const d = c.dossier_cee || {}
    if (d.date_engagement) {
      events.push({ id:c.id+'-eng', clientId:c.id, date:parseISO(d.date_engagement),
        kind:'Engagement', title: c.raison_sociale, color:'#3F4F40', icon: Sparkles, sub:'Démarrage travaux' })
    }
    if (d.date_achevement) {
      events.push({ id:c.id+'-ach', clientId:c.id, date:parseISO(d.date_achevement),
        kind:'Achèvement', title: c.raison_sociale, color:'#3F4F40', icon: Sparkles, sub:'Fin travaux' })
    }
    if (d.date_depot_pncee) {
      events.push({ id:c.id+'-pncee', clientId:c.id, date:parseISO(d.date_depot_pncee),
        kind:'PNCEE', title: c.raison_sociale, color:'#C5A572', icon: FileText, sub:'Dépôt PNCEE' })
    }
  })
  return events
}

export default function AgendaPage () {
  const { clients } = useClients()
  const nav = useNavigate()
  const [cursor, setCursor] = useState(new Date())

  const events = useMemo(() => eventsFromClients(clients), [clients])

  // Grille calendrier mensuel
  const grid = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { locale: fr })
    const end   = endOfWeek(endOfMonth(cursor),   { locale: fr })
    const days = []
    let d = start
    while (d <= end) { days.push(d); d = addDays(d, 1) }
    return days
  }, [cursor])

  const eventsOn = (day) => events.filter(e => isSameDay(e.date, day))

  // Prochaines actions (liste à droite)
  const upcoming = useMemo(() => {
    return [...events]
      .filter(e => differenceInCalendarDays(e.date, new Date()) >= -1)
      .sort((a,b) => a.date - b.date)
      .slice(0, 20)
  }, [events])

  const overdue = events.filter(e => isPast(e.date) && !isSameDay(e.date, new Date()))

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1500px] mx-auto">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="eyebrow">Vue calendaire</div>
          <h1 className="font-display text-4xl md:text-5xl text-deep tracking-tight">Agenda</h1>
          <p className="text-sm text-mute mt-1 font-serif">Assemblées générales, prochaines actions et jalons CEE.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={()=> setCursor(c => subMonths(c, 1))}>Mois précédent</Button>
          <Button variant="outline" size="sm" onClick={()=> setCursor(new Date())}>Aujourd'hui</Button>
          <Button variant="ghost" size="sm" iconRight={ChevronRight} onClick={()=> setCursor(c => addMonths(c, 1))}>Mois suivant</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        {/* Calendar */}
        <Card className="!p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-2xl text-deep capitalize">{format(cursor, 'MMMM yyyy', { locale: fr })}</h2>
            <div className="eyebrow">{events.length} évènements au total</div>
          </div>
          <div className="grid grid-cols-7 gap-px bg-paper-300/70 border border-paper-300/70 rounded-md overflow-hidden">
            {['L','M','M','J','V','S','D'].map((d,i) => (
              <div key={i} className="bg-paper-100 px-2 py-1.5 text-[10px] uppercase tracking-editorial text-soft font-medium text-center">{d}</div>
            ))}
            {grid.map((day, i) => {
              const evs = eventsOn(day)
              const isOff = !isSameMonth(day, cursor)
              const isToday = isSameDay(day, new Date())
              return (
                <div key={i} className={cls('bg-paper-50 min-h-[88px] p-1.5 relative',
                  isOff && 'bg-paper-100/50',
                  isToday && 'ring-2 ring-copper-300 ring-inset')}>
                  <div className={cls('num text-[11px] mb-1',
                    isOff ? 'text-soft' : 'text-deep',
                    isToday && 'text-copper-500 font-semibold')}>{format(day, 'd')}</div>
                  <div className="flex flex-col gap-0.5">
                    {evs.slice(0,3).map(e => (
                      <button key={e.id} onClick={() => nav('/clients/'+e.clientId)}
                        className="w-full text-left px-1 py-0.5 rounded text-[10px] leading-tight truncate hover:bg-paper-200/70"
                        style={{ borderLeft: `2px solid ${e.color}` }}
                        title={`${e.kind} — ${e.title}`}>
                        <span className="text-deep">{e.title}</span>
                      </button>
                    ))}
                    {evs.length > 3 && <span className="text-[10px] text-soft px-1">+{evs.length-3} autres</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Liste prochaines actions */}
        <div className="flex flex-col gap-4">
          {overdue.length > 0 && (
            <Card className="!p-4 bg-brick-50/60">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-brick-400"/>
                <div className="eyebrow !text-brick-400">{overdue.length} en retard</div>
              </div>
              <div className="flex flex-col gap-1">
                {overdue.slice(0,5).map(e => (
                  <button key={e.id} onClick={()=> nav('/clients/'+e.clientId)}
                    className="text-left px-2 py-1 rounded hover:bg-paper-100 text-xs">
                    <div className="font-medium text-deep truncate">{e.title}</div>
                    <div className="text-soft">{e.sub} · {fmtDate(e.date)}</div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          <Card className="!p-4">
            <div className="eyebrow mb-3">Prochaines échéances</div>
            <div className="flex flex-col gap-2">
              {upcoming.length === 0 && <div className="text-sm text-soft italic">Rien à venir.</div>}
              {upcoming.map(e => {
                const jours = differenceInCalendarDays(e.date, new Date())
                return (
                  <button key={e.id} onClick={()=> nav('/clients/'+e.clientId)}
                    className="text-left p-2 rounded-md hover:bg-paper-100 border border-paper-300/40 flex items-start gap-2">
                    <span className="w-1 self-stretch rounded" style={{ background: e.color }}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge size="xs" color={e.color}>{e.kind}</Badge>
                        <span className="num text-[10px] text-soft">
                          {jours === 0 ? "aujourd'hui" : jours > 0 ? `J+${jours}` : `J${jours}`}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-deep truncate mt-1">{e.title}</div>
                      <div className="text-xs text-soft">{e.sub} · {fmtDate(e.date)}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
