import { Search, Sun, Moon, LogOut, Command } from 'lucide-react'
import { useAuth }  from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { cls, initials } from '../../lib/utils'

export default function Topbar ({ onOpenPalette }) {
  const { session, signOut } = useAuth()
  const { theme, toggle }    = useTheme()
  return (
    <header className="sticky top-0 z-20 h-16 bg-paper-100/95 border-b border-paper-300/70 flex items-center px-6 gap-4 backdrop-blur-md">
      <button onClick={onOpenPalette}
        className="flex-1 max-w-2xl h-10 px-4 rounded-md bg-paper-50 hover:bg-white border border-paper-300/60 flex items-center gap-3 text-soft hover:text-deep transition-colors">
        <Search className="w-4 h-4" />
        <span className="text-[13.5px]">Rechercher clients, pages, actions…</span>
        <kbd className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-editorial text-soft bg-paper-200/60 border border-paper-300/60 rounded px-1.5 py-0.5">
          <Command className="w-3 h-3"/>K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <button onClick={toggle} title="Thème"
          className="w-9 h-9 rounded-md hover:bg-paper-200/70 grid place-items-center text-mute hover:text-deep transition-colors">
          {theme === 'dark' ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
        </button>
        <div className="hidden sm:flex items-center gap-3 pl-2 pr-1 h-9 rounded-md hover:bg-paper-200/50 transition-colors">
          <div className="w-7 h-7 rounded-full bg-ink-600 grid place-items-center text-[11px] font-medium text-paper-50 font-display">
            {initials(session?.prenom)}
          </div>
          <div className="text-sm leading-tight pr-1 hidden lg:block">
            <div className="font-medium text-deep text-[13px]">{session?.prenom}</div>
            <div className="text-[9px] uppercase tracking-editorial text-soft">{session?.role}</div>
          </div>
          <button onClick={signOut} title="Déconnexion"
            className="w-7 h-7 rounded grid place-items-center text-soft hover:text-deep">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
