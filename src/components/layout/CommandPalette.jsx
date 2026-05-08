import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, ArrowRight, LayoutDashboard, Users, Kanban, MapPinned, Settings, Plus, X } from 'lucide-react'
import { cls } from '../../lib/utils'

const PAGES = [
  { id:'dash', label:'Dashboard',  to:'/dashboard',  icon: LayoutDashboard, kind:'Page' },
  { id:'cli',  label:'Clients',    to:'/clients',    icon: Users,           kind:'Page' },
  { id:'pip',  label:'Pipeline',   to:'/pipeline',   icon: Kanban,          kind:'Page' },
  { id:'map',  label:'Carte',      to:'/carte',      icon: MapPinned,       kind:'Page' },
  { id:'set',  label:'Paramètres', to:'/parametres', icon: Settings,        kind:'Page' }
]

export default function CommandPalette ({ open, onClose, clients=[], onCreateClient }) {
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const ref = useRef(null)
  const nav = useNavigate()

  useEffect(() => { if (open) { setQ(''); setIdx(0); setTimeout(() => ref.current?.focus(), 50) } }, [open])

  const items = useMemo(() => {
    const list = []
    list.push({ id:'new', label:'Nouveau client', icon: Plus, kind:'Action', run: () => { onClose(); onCreateClient?.() } })
    PAGES.forEach(p => list.push({ ...p, run: () => { onClose(); nav(p.to) } }))
    clients.slice(0, 80).forEach(c => list.push({
      id: c.id,
      label: `${c.client_id} — ${c.raison_sociale || '(sans nom)'}`,
      sub:   c.adresse_chantier?.ville || c.adresse_facturation?.ville,
      icon:  Users, kind:'Client',
      run:   () => { onClose(); nav('/clients?id=' + c.id) }
    }))
    if (!q) return list
    const t = q.toLowerCase()
    return list.filter(i => (i.label + ' ' + (i.sub||'')).toLowerCase().includes(t))
  }, [q, clients, nav, onClose, onCreateClient])

  useEffect(() => {
    const onKey = e => {
      if (!open) return
      if (e.key === 'Escape')      onClose()
      if (e.key === 'ArrowDown')   { e.preventDefault(); setIdx(i => Math.min(items.length-1, i+1)) }
      if (e.key === 'ArrowUp')     { e.preventDefault(); setIdx(i => Math.max(0, i-1)) }
      if (e.key === 'Enter')       { e.preventDefault(); items[idx]?.run?.() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, items, idx, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4"
          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <div className="absolute inset-0 bg-ink-900/70 backdrop-blur-sm" onClick={onClose}/>
          <motion.div
            initial={{ opacity:0, y:-20, scale:.97 }}
            animate={{ opacity:1, y:0,  scale:1   }}
            exit={{    opacity:0, y:-12, scale:.97 }}
            transition={{ type:'spring', stiffness:280, damping:24 }}
            className="relative w-full max-w-2xl glass-strong rounded-2xl shadow-card overflow-hidden">
            <div className="flex items-center gap-3 px-4 h-14 border-b border-white/5">
              <Search className="w-5 h-5 text-ink-300" />
              <input ref={ref}
                value={q}
                onChange={e => { setQ(e.target.value); setIdx(0) }}
                placeholder="Tapez pour chercher : clients, pages, actions…"
                className="flex-1 bg-transparent outline-none text-base placeholder:text-ink-300/60" />
              <button onClick={onClose} className="text-ink-300 hover:text-white p-1.5 rounded-lg hover:bg-white/5">
                <X className="w-4 h-4"/>
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {items.length === 0 && (
                <div className="text-sm text-ink-300 p-8 text-center">Aucun résultat.</div>
              )}
              {items.map((it, i) => (
                <button key={it.kind+it.id} onClick={() => it.run?.()}
                  onMouseEnter={() => setIdx(i)}
                  className={cls('w-full px-4 h-12 flex items-center gap-3 text-left',
                    i === idx ? 'bg-white/[.05]' : 'hover:bg-white/[.03]')}>
                  <span className="w-8 h-8 rounded-lg bg-white/[.05] grid place-items-center">
                    <it.icon className="w-4 h-4 text-ink-200"/>
                  </span>
                  <span className="flex-1 truncate">
                    <span className="text-sm">{it.label}</span>
                    {it.sub && <span className="text-xs text-ink-300 ml-2">· {it.sub}</span>}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-ink-300">{it.kind}</span>
                  <ArrowRight className={cls('w-4 h-4', i === idx ? 'text-white' : 'text-ink-400')}/>
                </button>
              ))}
            </div>
            <div className="px-4 h-10 border-t border-white/5 text-[11px] text-ink-300 flex items-center gap-3">
              <span>↑↓ Naviguer</span><span>↵ Ouvrir</span><span>Esc Fermer</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
