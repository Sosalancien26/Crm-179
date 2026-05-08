import { motion } from 'framer-motion'
import { cls } from '../../lib/utils'

const VARIANTS = {
  primary: 'bg-gradient-primary text-white hover:shadow-glow',
  ghost:   'bg-white/[.04] hover:bg-white/[.08] text-ink-100 border border-white/[.06]',
  outline: 'bg-transparent hover:bg-white/[.04] text-ink-100 border border-white/[.10]',
  danger:  'bg-gradient-to-br from-rose-500 to-red-600 text-white hover:shadow-[0_0_0_1px_rgba(244,63,94,.4),0_8px_24px_-8px_rgba(244,63,94,.6)]',
  gold:    'bg-gradient-gold text-ink-900 hover:shadow-[0_0_0_1px_rgba(212,175,55,.4),0_8px_24px_-8px_rgba(212,175,55,.6)] font-semibold'
}
const SIZES = {
  xs: 'h-7 px-2.5 text-xs rounded-lg',
  sm: 'h-8 px-3 text-sm rounded-lg',
  md: 'h-10 px-4 text-sm rounded-xl',
  lg: 'h-12 px-5 text-base rounded-xl'
}

export default function Button ({
  children, className, variant='primary', size='md',
  type='button', disabled, loading, icon:Icon, iconRight:IR, ...props
}) {
  return (
    <motion.button
      whileHover={!disabled ? { y:-1 } : {}}
      whileTap={!disabled ? { scale: .98 } : {}}
      transition={{ type:'spring', stiffness:400, damping:22 }}
      type={type} disabled={disabled || loading}
      className={cls(
        'inline-flex items-center justify-center gap-2 font-medium select-none focus-ring',
        'disabled:opacity-50 disabled:cursor-not-allowed transition-shadow',
        SIZES[size], VARIANTS[variant], className
      )}
      {...props}>
      {loading
        ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        : Icon && <Icon className="w-4 h-4" />}
      {children}
      {IR && <IR className="w-4 h-4" />}
    </motion.button>
  )
}
