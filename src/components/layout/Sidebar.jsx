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
      animate={{ width: collapsed ? 76 : 260 }}
      transition={{ type:'spring', stiffness:280, damping:32 }}
      className="hidden md:flex flex-col h-screen sticky top-0 z-30 bg-paper-50 border-r border-paper-300">
      {/* Logo zone */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-paper-300">
        <div className="w-9 h-9 rounded-lg bg-gradient-warm grid place-items-center shrink-0">
          <Flame className="w-5 h-5 text-paper-50" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-display text-lg font-semibold leading-none text-deep">CRM 179</div>
            <div className="text-[10px] uppercase tracking-editorial text-soft mt-0.5">BAR-TH-179</div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        {!collapsed && (
          <div className="eyebrow px-3 mb-2 mt-2">Navigation</div>
        )}
        {NAV.map(({to, label, icon:Icon}) => (
          <NavLink key={to} to={to}
            className={({isActive}) => cls(
              'relative group flex items-center gap-3 px-3 h-10 rounded-md transition-colors',
              isActive ? 'text-deep bg-paper-200' : 'text-mute hover:text-deep hover:bg-paper-100'
            )}>
            {({isActive}) => (
              <>
                {isActive && (
                  <motion.span layoutId="active-bar"
                    className="absolute left-0 top-2 bottom-2 w-0.5 bg-copper-400 rounded-r-full" />
                )}
                <Icon className={cls('w-[18px] h-[18px] shrink-0', isActive ? 'text-copper-400' : '')} />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3">
        <button onClick={onToggle}
          className="w-full h-9 rounded-md border border-paper-300 bg-paper-50 hover:bg-paper-100 flex items-center justify-center text-soft hover:text-deep transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4"/> : <ChevronLeft className="w-4 h-4"/>}
        </button>
      </div>
    </motion.aside>
  )
}
