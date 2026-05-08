import { Search, Sun, Moon, LogOut, Command, Bell } from 'lucide-react'
import { useAuth }  from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { cls, initials } from '../../lib/utils'

export default function Topbar ({ onOpenPalette }) {
  const { session, signOut } = useAuth()
  const { theme, toggle }    = useTheme()
  return (
    <header className="sticky top-0 z-20 h-16 bg-paper-100/85 border-b border-paper-300 flex items-center px-4 gap-3 backdrop-blur-md">
      <button onClick={onOpenPalette}
        className="flex-1 max-w-xl h-10 px-3.5 rounded-md bg-paper-50 hover:bg-white border border-paper-300 hover:border-paper-400 flex items-center gap-3 text-soft hover:text-deep transition-colors shadow-paper">
        <Search className="w-4 h-4" />
        <span className="text-sm">Rechercher clients, pages, actions…</span>
        <kbd className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-editorial text-soft bg-paper-200 border border-paper-300 rounded px-1.5 py-0.5">
          <Command className="w-3 h-3"/> K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <button className="w-10 h-10 rounded-md bg-paper-50 border border-paper-300 grid place-items-center hover:bg-white text-mute hover:text-deep relative shadow-paper">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-copper-400"/>
        </button>
        <button onClick={toggle} title="Thème"
          className="w-10 h-10 rounded-md bg-paper-50 border border-paper-300 grid place-items-center hover:bg-white text-mute hover:text-deep shadow-paper">
          {theme === 'dark' ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
        </button>
        <div className="hidden sm:flex items-center gap-3 pl-2 pr-2 h-10 rounded-md bg-paper-50 border border-paper-300 shadow-paper">
          <div className="w-7 h-7 rounded-md bg-ink-700 grid place-items-center text-xs font-semibold text-paper-50 font-display">
            {initials(session?.prenom)}
          </div>
          <div className="text-sm leading-tight pr-1">
            <div className="font-medium text-deep">{session?.prenom}</div>
            <div className="text-[9px] uppercase tracking-editorial text-soft">{session?.role}</div>
          </div>
          <button onClick={signOut} title="Déconnexion"
            className="w-8 h-8 rounded grid place-items-center text-mute hover:text-brick-400 hover:bg-paper-200">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
