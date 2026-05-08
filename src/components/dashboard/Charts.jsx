import { useMemo } from 'react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart
} from 'recharts'
import { format, parseISO, startOfMonth, addMonths, isSameMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { fmtEUR, hexToRgba } from '../../lib/utils'

const TooltipBox = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-ink-800/95 border border-white/10 px-3 py-2 backdrop-blur-md text-xs shadow-card">
      {label && <div className="text-ink-300 mb-1">{label}</div>}
      {payload.map((p,i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background:p.color || p.payload?.color }}/>
          <span>{p.name}</span>
          <span className="ml-auto font-mono">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export function DonutTypes ({ clients, byCat }) {
  const data = useMemo(() => {
    const types = byCat('type_client')
    const counts = {}
    clients.forEach(c => { const t = c.type_client || 'Autre'; counts[t] = (counts[t]||0)+1 })
    return Object.entries(counts).map(([label, value]) => ({
      name: label, value, color: types.find(t=>t.valeur===label)?.couleur || '#7C3AED'
    }))
  }, [clients, byCat])
  return (
    <Card className="h-[320px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display text-base">Répartition par type</h3>
        <Badge size="xs">{clients.length} clients</Badge>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
            {data.map((d,i) => <Cell key={i} fill={d.color} stroke="rgba(0,0,0,.2)" />)}
          </Pie>
          <Tooltip content={<TooltipBox/>} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}

export function BarStatuts ({ clients, byCat }) {
  const data = useMemo(() => {
    const statuts = byCat('statut_client')
    const counts = {}
    clients.forEach(c => {
      const s = c.statut_client || '—'; counts[s] = (counts[s]||0)+1
    })
    return statuts.map(s => ({ name: s.valeur, count: counts[s.valeur] || 0, color: s.couleur }))
      .filter(d => d.count > 0).sort((a,b)=> b.count - a.count).slice(0, 10)
  }, [clients, byCat])
  return (
    <Card className="h-[320px]">
      <h3 className="font-display text-base mb-2">Top statuts client</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
          <CartesianGrid stroke="rgba(255,255,255,.04)" horizontal={false}/>
          <XAxis type="number" stroke="#8A8AA0" tick={{ fontSize:11 }} />
          <YAxis type="category" dataKey="name" stroke="#8A8AA0" tick={{ fontSize:11 }} width={130} />
          <Tooltip content={<TooltipBox/>} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
          <Bar dataKey="count" radius={[0,8,8,0]}>
            {data.map((d,i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

export function LineSignatures ({ clients }) {
  const data = useMemo(() => {
    const start = startOfMonth(addMonths(new Date(), -11))
    const months = Array.from({length:12}, (_,i) => addMonths(start, i))
    return months.map(m => {
      const signed = clients.filter(c => {
        if (c.statut_devis !== 'Signé' || !c.devis?.date_signature) return false
        return isSameMonth(parseISO(c.devis.date_signature), m)
      })
      return {
        name: format(m, 'MMM', { locale: fr }),
        signs: signed.length,
        montant: signed.reduce((a,b) => a + Number(b.devis?.montant_ttc||0), 0)
      }
    })
  }, [clients])
  return (
    <Card className="h-[320px]">
      <h3 className="font-display text-base mb-2">Signatures sur 12 mois</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data} margin={{ left:0, right:10, top:8 }}>
          <defs>
            <linearGradient id="grSign" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%"  stopColor="#7C3AED" stopOpacity={.7}/>
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,.05)" />
          <XAxis dataKey="name" stroke="#8A8AA0" tick={{ fontSize:11 }} />
          <YAxis stroke="#8A8AA0" tick={{ fontSize:11 }} width={28} />
          <Tooltip content={<TooltipBox/>} />
          <Area type="monotone" dataKey="signs" stroke="#7C3AED" fill="url(#grSign)" strokeWidth={2.5} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}

export function TopClients ({ clients }) {
  const top = useMemo(() => {
    return [...clients]
      .filter(c => c.devis?.montant_ttc)
      .sort((a,b) => Number(b.devis?.montant_ttc||0) - Number(a.devis?.montant_ttc||0))
      .slice(0, 5)
  }, [clients])
  const max = Math.max(1, ...top.map(c => Number(c.devis?.montant_ttc||0)))
  return (
    <Card className="h-[320px] flex flex-col">
      <h3 className="font-display text-base mb-3">Top 5 clients par montant</h3>
      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1">
        {top.length === 0 && <div className="text-sm text-ink-300 italic">Aucun devis chiffré pour l'instant.</div>}
        {top.map((c,i) => {
          const m = Number(c.devis?.montant_ttc||0)
          const pct = m / max
          return (
            <div key={c.id} className="rounded-xl bg-white/[.03] border border-white/[.05] p-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-gradient-primary text-white grid place-items-center text-xs font-mono">{i+1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{c.raison_sociale || c.client_id}</div>
                  <div className="text-[11px] text-ink-300 truncate">{c.adresse_chantier?.ville || c.type_client}</div>
                </div>
                <div className="font-mono text-sm">{fmtEUR(m)}</div>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/[.05] overflow-hidden">
                <div className="h-full bg-gradient-primary" style={{ width: (pct*100)+'%' }}/>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
