import { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react'

const ToastCtx = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error:   XCircle,
  warn:    AlertTriangle,
  info:    Info
}
const COLORS = {
  success: 'from-emerald-500 to-green-500',
  error:   'from-rose-500 to-red-500',
  warn:    'from-amber-500 to-orange-500',
  info:    'from-blue-500 to-indigo-500'
}

export function ToastProvider ({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((msg, type='info', ttl=3500) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), ttl)
  }, [])

  const api = {
    info:    (m,t) => push(m,'info',t),
    success: (m,t) => push(m,'success',t),
    error:   (m,t) => push(m,'error',t),
    warn:    (m,t) => push(m,'warn',t)
  }

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-[360px] max-w-[calc(100vw-3rem)]">
        <AnimatePresence>
          {toasts.map(t => {
            const Icon = ICONS[t.type] || Info
            return (
              <motion.div key={t.id}
                initial={{ opacity:0, y:24, scale:.96 }}
                animate={{ opacity:1, y:0, scale:1 }}
                exit={{ opacity:0, x:60, scale:.96 }}
                transition={{ type:'spring', stiffness:280, damping:22 }}
                className="relative overflow-hidden rounded-xl border border-white/10 bg-ink-800/95 backdrop-blur-xl shadow-card">
                <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${COLORS[t.type]}`}/>
                <div className="flex items-start gap-3 p-3 pl-4">
                  <Icon className="w-5 h-5 mt-0.5 text-ink-100/90" />
                  <div className="flex-1 text-sm text-ink-100">{t.msg}</div>
                  <button onClick={()=> setToasts(arr => arr.filter(x => x.id !== t.id))}
                          className="text-ink-300 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
