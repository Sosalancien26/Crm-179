import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const ThemeCtx = createContext(null)
const KEY = 'crm179_theme'

export function ThemeProvider ({ children }) {
  // Default = light (mode papier éditorial). Si l'utilisateur a explicitement
  // choisi 'dark' précédemment, on respecte son choix, sinon light.
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY)
      return saved === 'dark' || saved === 'light' ? saved : 'light'
    } catch { return 'light' }
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try { localStorage.setItem(KEY, theme) } catch {}
  }, [theme])

  const toggle = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), [])

  return <ThemeCtx.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeCtx.Provider>
}

export const useTheme = () => useContext(ThemeCtx)
