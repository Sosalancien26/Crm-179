import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Eye, ArrowUpDown, ArrowUp, ArrowDown, Sparkles, Phone, Mail } from 'lucide-react'
import Badge from '../ui/Badge'
import StarRating from '../ui/StarRating'
import { fmtEUR, fmtRelative, cls } from '../../lib/utils'

const COLS = [
  { key:'client_id',      label:'ID',           sort: c => c.client_id || '' },
  { key:'raison',         label:'Client',       sort: c => (c.raison_sociale||'').toLowerCase() },
  { key:'type',           label:'Type',         sort: c => c.type_client || '' },
  { key:'ville',          label:'Ville chantier', sort: c => c.adresse_chantier?.ville || '' },
  { key:'statut',         label:'Statut',       sort: c => c.statut_client || '' },
  { key:'montant',        label:'Montant',      sort: c => Number(c.devis?.montant_ttc || 0), num:true, right:true },
  { key:'score',          label:'Score',        sort: c => c.score_chaleur || 0, num:true },
  { key:'maj',            label:'Dernière maj', sort: c => c.updated_at || c.created_at || '' }
]

export default function ClientList ({ clients, onOpen, paramColors }) {
  const [sortKey, setSortKey] = useState('maj')
  const [sortDir, setSortDir] = useState('desc')

  const sorted = useMemo(() => {
    const col = COLS.find(c => c.key === sortKey)
    if (!col) return clients
    const arr = [...clients].sort((a,b) => {
      const va = col.sort(a), vb = col.sort(b)
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return arr
  }, [clients, sortKey, sortDir])

  const toggle = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  if (!sorted.length) {
    return <div className="text-center py-16 text-soft">Aucun client trouvé pour ces filtres.</div>
  }
  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-editorial text-soft bg-paper-100/60 border-b border-paper-300/70">
              {COLS.map(c => (
                <th key={c.key}
                    className={cls('px-4 py-3 cursor-pointer hover:text-deep transition-colors select-none', c.right ? 'text-right' : 'text-left')}
                    onClick={() => toggle(c.key)}>
                  <span className="inline-flex items-center gap-1.5">
                    {c.label}
                    {sortKey === c.key
                      ? (sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-copper-400"/> : <ArrowDown className="w-3 h-3 text-copper-400"/>)
                      : <ArrowUpDown className="w-3 h-3 opacity-30"/>}
                  </span>
                </th>
              ))}
              <th className="text-right px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => {
              const sColor = paramColors?.statut_client?.[c.statut_client]
              const tColor = paramColors?.type_client?.[c.type_client]
              return (
                <motion.tr key={c.id}
                  initial={{ opacity:0, y:3 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: i*0.01, duration:.22 }}
                  className="row-hover border-t border-paper-200/70">
                  <td className="px-4 py-3 num text-xs text-soft">{c.client_id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-deep truncate max-w-[280px]">{c.raison_sociale || '—'}</div>
                      {c.coup_de_pouce_x3 && (
                        <span title="Coup de Pouce x3" className="inline-flex items-center gap-1 text-[10px] font-medium bg-copper-100 text-copper-500 px-1.5 py-0.5 rounded">
                          <Sparkles className="w-3 h-3"/>x3
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-soft flex items-center gap-3 mt-0.5">
                      {c.crm179_contacts?.[0]?.tel_mobile && <span className="flex items-center gap-1"><Phone className="w-3 h-3"/>{c.crm179_contacts[0].tel_mobile}</span>}
                      {c.crm179_contacts?.[0]?.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3"/>{c.crm179_contacts[0].email}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge color={tColor} size="xs">{c.type_client || '—'}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="truncate max-w-[180px] text-deep">{c.adresse_chantier?.ville || '—'}</div>
                    <div className="text-xs text-soft">{c.adresse_chantier?.departement || ''}{c.zone_climatique ? ' · '+c.zone_climatique : ''}</div>
                  </td>
                  <td className="px-4 py-3"><Badge color={sColor} size="xs" dot>{c.statut_client || '—'}</Badge></td>
                  <td className="px-4 py-3 text-right num">{c.devis?.montant_ttc ? fmtEUR(c.devis.montant_ttc) : <span className="text-soft">—</span>}</td>
                  <td className="px-4 py-3"><StarRating value={c.score_chaleur||0} readOnly size={14}/></td>
                  <td className="px-4 py-3 text-xs text-soft">{fmtRelative(c.updated_at || c.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onOpen(c)} className="text-soft hover:text-deep p-1.5 rounded hover:bg-paper-200">
                      <Eye className="w-4 h-4"/>
                    </button>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
