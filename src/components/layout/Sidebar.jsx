import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Users, Kanban, MapPinned, Settings, ChevronLeft, ChevronRight, Flame } from 'lucide-react'
import { cls } from '../../lib/utils'

const NAV = [
  { to:'/dashboard',  label:'Dashboard',  icon: LayoutDashboard },
  { to:'/clients',    label:'Clients',    icon: Users },
  { to:'/pipeline',   label:'Pipeline',   icon: Kanban },
  { to:'/carte',      label:'Carte',      icon: MapPinned },
  { to:'/parametres', label:'Paramètres', icon: Settings }
]

export default function Sidebar ({ collapsed, onToggle }) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 248 }}
      transition={{ type:'spring', stiffness:280, damping:32 }}
      className="hidden md:flex flex-col h-screen sticky top-0 z-30 glass-strong border-r border-white/[.05]">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-white/[.05]">
        <div className="w-9 h-9 rounded-xl bg-gradient-primary grid place-items-center shrink-0 shadow-glow">
          <Flame className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-display font-semibold leading-tight">CRM 179</div>
            <div className="text-[10px] uppercase tracking-widest text-ink-300">BAR-TH-179</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
        {NAV.map(({to, label, icon:Icon}) => (
          <NavLink key={to} to={to}
            className={({isActive}) => cls(
              'relative group flex items-center gap-3 px-3 h-10 rounded-xl transition-colors',
              isActive ? 'text-white bg-white/[.05]' : 'text-ink-200 hover:text-white hover:bg-white/[.03]'
            )}>
            {({isActive}) => (
              <>
                {isActive && (
                  <motion.span layoutId="active-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-violet/20 to-brand-blue/10 border border-white/[.06]" />
                )}
                <Icon className={cls('w-5 h-5 shrink-0 relative z-[1]', isActive && 'text-brand-violet')} />
                {!collapsed && <span className="relative z-[1] truncate text-sm">{label}</span>}
                {isActive && !collapsed && (
                  <span className="ml-auto relative z-[1] w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse-glow"/>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Toggle */}
      <button onClick={onToggle}
        className="m-3 h-9 rounded-xl glass border border-white/[.05] flex items-center justify-center text-ink-300 hover:text-white hover:bg-white/[.04] transition-colors">
        {collapsed ? <ChevronRight className="w-4 h-4"/> : <ChevronLeft className="w-4 h-4"/>}
      </button>
    </motion.aside>
  )
}
