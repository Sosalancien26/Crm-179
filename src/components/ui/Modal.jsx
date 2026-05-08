import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { cls } from '../../lib/utils'

export default function Modal ({ open, onClose, title, children, footer, size='md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = e => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const w = { sm:'max-w-md', md:'max-w-2xl', lg:'max-w-4xl', xl:'max-w-6xl' }[size] || 'max-w-2xl'

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <motion.div className="absolute inset-0 bg-ink-900/70 backdrop-blur-sm"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={onClose} />
          <motion.div
            initial={{ opacity:0, y:24, scale:.97 }}
            animate={{ opacity:1, y:0,  scale:1   }}
            exit={{    opacity:0, y:12, scale:.97 }}
            transition={{ type:'spring', stiffness:260, damping:26 }}
            className={cls('relative w-full glass-strong rounded-2xl shadow-card', w)}>
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h3 className="font-display text-lg">{title}</h3>
              <button onClick={onClose}
                className="text-ink-300 hover:text-white p-1.5 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
            {footer && <div className="px-5 py-4 border-t border-white/5 flex gap-2 justify-end">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Drawer ({ open, onClose, title, children, footer, width='720px' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-40"
          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
          <motion.div className="absolute inset-0 bg-ink-900/70 backdrop-blur-sm"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={onClose} />
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type:'spring', stiffness:240, damping:30 }}
            className="absolute top-0 right-0 h-full glass-strong border-l border-white/5 flex flex-col"
            style={{ width, maxWidth: '100vw' }}>
            <div className="flex items-center justify-between px-5 h-16 border-b border-white/5 sticky top-0 z-10 bg-ink-800/85 backdrop-blur-xl">
              <div className="font-display text-lg truncate pr-4">{title}</div>
              <button onClick={onClose}
                className="text-ink-300 hover:text-white p-2 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
            {footer && <div className="border-t border-white/5 p-4 flex gap-2 justify-end bg-ink-800/85 backdrop-blur-xl">{footer}</div>}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
