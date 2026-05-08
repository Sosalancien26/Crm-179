import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext, PointerSensor, useSensor, useSensors,
  closestCorners, DragOverlay
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { Phone, Mail, AlertCircle, Sparkles } from 'lucide-react'
import StarRating from '../ui/StarRating'
import { fmtEUR, fmtRelative, initials, cls } from '../../lib/utils'

const COLS = [
  { key: 'Prospect',         label: 'Prospect',        match: c => /Prospect|RDV planifié|Visite/.test(c.statut_client) },
  { key: 'RDV',              label: 'RDV',             match: c => c.statut_client === 'RDV planifié' || c.statut_client === 'Visite technique' },
  { key: 'Devis envoyé',     label: 'Devis envoyé',    match: c => c.statut_client === 'Devis envoyé' || c.statut_devis === 'Envoyé' },
  { key: 'En attente AG',    label: 'En attente AG',   match: c => c.statut_client === 'En attente AG' },
  { key: 'Signé',            label: 'Signé',           match: c => /Signé|AG validée/.test(c.statut_client) || c.statut_devis === 'Signé' },
  { key: 'Chantier en cours',label: 'Chantier en cours', match: c => c.statut_client === 'Chantier en cours' },
  { key: 'Terminé',          label: 'Terminé',         match: c => /Chantier terminé|Clôturé|Dossier CEE/.test(c.statut_client) }
]

// Quand on lâche dans une colonne, on applique ce statut client
const STATUS_BY_COL = {
  'Prospect':            'Prospect qualifié',
  'RDV':                 'RDV planifié',
  'Devis envoyé':        'Devis envoyé',
  'En attente AG':       'En attente AG',
  'Signé':               'Signé chantier à planifier',
  'Chantier en cours':   'Chantier en cours',
  'Terminé':             'Chantier terminé'
}

export default function KanbanBoard ({ clients, onMove }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const [activeId, setActiveId] = useState(null)

  const grouped = useMemo(() => {
    const out = Object.fromEntries(COLS.map(c => [c.key, []]))
    clients.forEach(c => {
      const col = COLS.find(co => co.match(c))?.key || 'Prospect'
      out[col].push(c)
    })
    return out
  }, [clients])

  const handleEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over) return
    const targetCol = COLS.find(c => c.key === over.id || grouped[c.key]?.some(x => x.id === over.id))?.key
    if (!targetCol) return
    const c = clients.find(x => x.id === active.id)
    if (!c) return
    const nouveau = STATUS_BY_COL[targetCol]
    if (!nouveau || c.statut_client === nouveau) return
    onMove(c.id, nouveau, c.statut_client)
  }

  const activeCard = clients.find(c => c.id === activeId)

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners}
      onDragStart={({ active })=> setActiveId(active.id)}
      onDragCancel={()=> setActiveId(null)}
      onDragEnd={handleEnd}>
      <div className="flex gap-4 overflow-x-auto pb-3 -mx-2 px-2">
        {COLS.map(col => (
          <Column key={col.key} id={col.key} label={col.label} items={grouped[col.key]} />
        ))}
      </div>
      <DragOverlay>{activeCard && <KanbanCard c={activeCard} dragging/>}</DragOverlay>
    </DndContext>
  )
}

function Column ({ id, label, items }) {
  const total = items.reduce((a,b)=> a + Number(b.devis?.montant_ttc||0), 0)
  return (
    <div className="w-80 shrink-0">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="font-display text-sm">{label}</div>
        <div className="text-xs text-ink-300 font-mono">{items.length} · {fmtEUR(total)}</div>
      </div>
      <div className="card !p-2 min-h-[300px] max-h-[78vh] overflow-y-auto" data-col={id}>
        <SortableContext id={id} items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 min-h-[60vh]" id={id}>
            {items.length === 0 && <div className="text-xs text-ink-300/70 italic text-center py-8">Glissez une carte ici</div>}
            {items.map(c => <SortableCard key={c.id} c={c} />)}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

function SortableCard ({ c }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: c.id })
  const style = {
    transform: CSS.Transform.toString(transform), transition,
    opacity: isDragging ? .35 : 1
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard c={c}/>
    </div>
  )
}

function KanbanCard ({ c, dragging }) {
  const nav = useNavigate()
  const overdue = c.date_prochaine_action
    ? differenceInCalendarDays(parseISO(c.date_prochaine_action), new Date()) < 0
    : false
  return (
    <motion.div
      whileHover={!dragging ? { y:-1 } : {}}
      onDoubleClick={() => nav('/clients?id=' + c.id)}
      className={cls('rounded-xl border bg-white/[.04] p-3 cursor-grab active:cursor-grabbing',
        'border-white/[.06] hover:border-white/[.12] transition-colors',
        dragging && 'shadow-glow border-white/30')}>
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold shrink-0">
          {initials(c.raison_sociale || c.client_id)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate flex items-center gap-2">
            {c.raison_sociale || c.client_id}
            {c.coup_de_pouce_x3 && <Sparkles className="w-3 h-3 text-amber-300"/>}
          </div>
          <div className="text-[11px] text-ink-300 truncate">{c.type_client} · {c.adresse_chantier?.ville || ''}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <StarRating value={c.score_chaleur||0} readOnly size={12}/>
        <span className="ml-auto font-mono text-xs">{c.devis?.montant_ttc ? fmtEUR(c.devis.montant_ttc) : '—'}</span>
      </div>
      {c.date_prochaine_action && (
        <div className={cls('mt-2 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded',
          overdue ? 'bg-rose-500/15 text-rose-300' : 'bg-white/[.04] text-ink-300')}>
          {overdue && <AlertCircle className="w-3 h-3"/>}
          {c.type_prochaine_action || 'Action'} · {fmtRelative(c.date_prochaine_action)}
        </div>
      )}
    </motion.div>
  )
}
