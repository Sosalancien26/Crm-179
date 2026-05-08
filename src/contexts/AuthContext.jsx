import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getSession, login as doLogin, logout as doLogout } from '../lib/auth'

const AuthCtx = createContext(null)

export function AuthProvider ({ children }) {
  const [session, setSession] = useState(null)
  const [ready,   setReady]   = useState(false)

  useEffect(() => { setSession(getSession()); setReady(true) }, [])

  const signIn  = useCallback(async (prenom, password) => {
    const s = await doLogin(prenom, password)
    setSession(s)
    return s
  }, [])
  const signOut = useCallback(() => { doLogout(); setSession(null) }, [])

  return (
    <AuthCtx.Provider value={{ session, ready, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
