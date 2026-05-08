import { motion } from 'framer-motion'
import { cls } from '../../lib/utils'

export default function Toggle ({ checked, onChange, label, className }) {
  return (
    <label className={cls('inline-flex items-center gap-2.5 cursor-pointer select-none', className)}>
      <button type="button" role="switch" aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={cls('relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-copper-400' : 'bg-paper-300')}>
        <motion.span layout
          className="absolute top-0.5 left-0.5 h-5 w-5 bg-paper-50 rounded-full shadow-sm"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type:'spring', stiffness:500, damping:30 }} />
      </button>
      {label && <span className="text-sm text-ink-600">{label}</span>}
    </label>
  )
}
