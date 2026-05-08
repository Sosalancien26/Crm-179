import { Search, Sun, Moon, LogOut, Command, Bell } from 'lucide-react'
import { useAuth }  from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { cls, initials } from '../../lib/utils'

export default function Topbar ({ onOpenPalette }) {
  const { session, signOut } = useAuth()
  const { theme, toggle }    = useTheme()
  return (
    <header className="sticky top-0 z-20 h-16 glass border-b border-white/[.05] flex items-center px-4 gap-3 backdrop-blur-xl">
      {/* Recherche globale (cmd+K) */}
      <button onClick={onOpenPalette}
        className="flex-1 max-w-xl h-10 px-3.5 rounded-xl bg-white/[.03] hover:bg-white/[.05] border border-white/[.06] flex items-center gap-3 text-ink-300 hover:text-ink-100 transition-colors">
        <Search className="w-4 h-4" />
        <span className="text-sm">Rechercher clients, pages, actions…</span>
        <kbd className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-ink-300/80 bg-white/[.05] border border-white/[.06] rounded px-1.5 py-0.5">
          <Command className="w-3 h-3"/> K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <button className="w-10 h-10 rounded-xl glass border border-white/[.05] grid place-items-center hover:bg-white/[.04] text-ink-200 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-gold animate-pulse-glow"/>
        </button>
        <button onClick={toggle} title="Thème"
          className="w-10 h-10 rounded-xl glass border border-white/[.05] grid place-items-center hover:bg-white/[.04] text-ink-200">
          {theme === 'dark' ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
        </button>
        <div className="hidden sm:flex items-center gap-3 pl-2 pr-2 h-10 rounded-xl glass border border-white/[.05]">
          <div className="w-7 h-7 rounded-lg bg-gradient-primary grid place-items-center text-xs font-semibold text-white">
            {initials(session?.prenom)}
          </div>
          <div className="text-sm leading-tight pr-1">
            <div className="font-medium">{session?.prenom}</div>
            <div className="text-[10px] uppercase tracking-wider text-ink-300">{session?.role}</div>
          </div>
          <button onClick={signOut} title="Déconnexion"
            className={cls('w-8 h-8 rounded-lg grid place-items-center text-ink-300 hover:text-white hover:bg-white/[.06]')}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
