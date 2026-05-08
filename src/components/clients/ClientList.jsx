import { motion } from 'framer-motion'
import { Eye, AlertTriangle, Sparkles, Phone, Mail } from 'lucide-react'
import Badge from '../ui/Badge'
import StarRating from '../ui/StarRating'
import { fmtEUR, fmtRelative, cls } from '../../lib/utils'

export default function ClientList ({ clients, onOpen, paramColors }) {
  if (!clients.length) {
    return (
      <div className="text-center py-16 text-ink-300">
        Aucun client trouvé pour ces filtres.
      </div>
    )
  }
  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-ink-300 bg-white/[.02]">
              <th className="text-left px-4 py-3">ID</th>
              <th className="text-left px-4 py-3">Client</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Ville chantier</th>
              <th className="text-left px-4 py-3">Statut</th>
              <th className="text-right px-4 py-3">Montant</th>
              <th className="text-left px-4 py-3">Score</th>
              <th className="text-left px-4 py-3">Dernière maj</th>
              <th className="text-right px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c, i) => {
              const sColor = paramColors?.statut_client?.[c.statut_client]
              const tColor = paramColors?.type_client?.[c.type_client]
              return (
                <motion.tr key={c.id}
                  initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: i*0.015, duration: .25 }}
                  className="row-hover border-t border-white/[.04]">
                  <td className="px-4 py-3 font-mono text-xs text-ink-300">{c.client_id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="font-medium truncate max-w-[260px]">{c.raison_sociale || '—'}</div>
                      {c.coup_de_pouce_x3 && (
                        <span title="Coup de Pouce x3" className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-400/15 text-amber-300 px-1.5 py-0.5 rounded">
                          <Sparkles className="w-3 h-3"/>x3
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-ink-300 flex items-center gap-3">
                      {c.crm179_contacts?.[0]?.tel_mobile && <span className="flex items-center gap-1"><Phone className="w-3 h-3"/>{c.crm179_contacts[0].tel_mobile}</span>}
                      {c.crm179_contacts?.[0]?.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3"/>{c.crm179_contacts[0].email}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge color={tColor} size="xs">{c.type_client || '—'}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="truncate max-w-[180px]">{c.adresse_chantier?.ville || '—'}</div>
                    <div className="text-xs text-ink-300">{c.adresse_chantier?.departement || ''}{c.zone_climatique ? ' · '+c.zone_climatique : ''}</div>
                  </td>
                  <td className="px-4 py-3"><Badge color={sColor} size="xs" dot>{c.statut_client || '—'}</Badge></td>
                  <td className="px-4 py-3 text-right font-mono">{c.devis?.montant_ttc ? fmtEUR(c.devis.montant_ttc) : <span className="text-ink-300">—</span>}</td>
                  <td className="px-4 py-3"><StarRating value={c.score_chaleur||0} readOnly size={14}/></td>
                  <td className="px-4 py-3 text-xs text-ink-300">{fmtRelative(c.updated_at || c.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onOpen(c)} className="text-ink-300 hover:text-white p-1.5 rounded-lg hover:bg-white/[.06]">
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
