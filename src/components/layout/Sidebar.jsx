import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Users, Kanban, MapPinned, Settings, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { cls } from '../../lib/utils'

const NAV = [
  { to:'/dashboard',  label:'Dashboard',  icon: LayoutDashboard },
  { to:'/clients',    label:'Clients',    icon: Users },
  { to:'/pipeline',   label:'Pipeline',   icon: Kanban },
  { to:'/agenda',     label:'Agenda',     icon: Calendar },
  { to:'/carte',      label:'Carte',      icon: MapPinned },
  { to:'/parametres', label:'Paramètres', icon: Settings }
]

export default function Sidebar ({ collapsed, onToggle }) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 240 }}
      transition={{ type:'spring', stiffness:280, damping:32 }}
      className="hidden md:flex flex-col h-screen sticky top-0 z-30 bg-paper-100 border-r border-paper-300/70">

      {/* Bandeau marque */}
      <div className="h-20 flex flex-col items-center justify-center border-b border-paper-300/70 px-4">
        {!collapsed ? (
          <>
            <div className="font-display text-3xl font-medium text-deep tracking-tight leading-none">CRM 179</div>
            <div className="eyebrow mt-2">BAR-TH-179</div>
          </>
        ) : (
          <div className="font-display text-2xl text-deep">179</div>
        )}
      </div>

      <nav className="flex-1 px-3 py-6 flex flex-col gap-0.5">
        {NAV.map(({to, label, icon:Icon}) => (
          <NavLink key={to} to={to}
            className={({isActive}) => cls(
              'group flex items-center gap-3 px-3 h-10 rounded-md transition-colors relative',
              isActive ? 'text-deep' : 'text-mute hover:text-deep'
            )}>
            {({isActive}) => (
              <>
                {isActive && (
                  <motion.span layoutId="active-bar"
                    className="absolute inset-0 bg-paper-200/70 rounded-md" />
                )}
                <Icon className={cls('w-[17px] h-[17px] shrink-0 relative z-[1]', isActive ? 'text-copper-400' : '')} />
                {!collapsed && <span className={cls('text-[13.5px] relative z-[1]', isActive ? 'font-medium' : '')}>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-paper-300/70">
        <button onClick={onToggle}
          className="w-full h-9 rounded-md hover:bg-paper-200/70 flex items-center justify-center text-soft hover:text-deep transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4"/> : <ChevronLeft className="w-4 h-4"/>}
        </button>
      </div>
    </motion.aside>
  )
}
