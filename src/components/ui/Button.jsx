import { motion } from 'framer-motion'
import { cls } from '../../lib/utils'

const VARIANTS = {
  primary: 'bg-ink-700 text-paper-50 hover:bg-ink-600 shadow-paper hover:shadow-soft',
  copper:  'bg-copper-400 text-paper-50 hover:bg-copper-500 shadow-paper hover:shadow-soft',
  ghost:   'bg-transparent hover:bg-paper-200 text-ink-600 border border-paper-300',
  outline: 'bg-paper-50 hover:bg-paper-100 text-ink-700 border border-paper-300 shadow-paper',
  danger:  'bg-brick-400 text-paper-50 hover:bg-brick-500 shadow-paper',
  link:    'bg-transparent text-copper-400 hover:text-copper-500 underline underline-offset-4 decoration-paper-300 hover:decoration-copper-400 px-1'
}
const SIZES = {
  xs: 'h-7  px-2.5 text-xs rounded-md',
  sm: 'h-8  px-3   text-sm rounded-md',
  md: 'h-10 px-4   text-sm rounded-lg',
  lg: 'h-12 px-5   text-base rounded-lg'
}

export default function Button ({
  children, className, variant='primary', size='md',
  type='button', disabled, loading, icon:Icon, iconRight:IR, ...props
}) {
  return (
    <motion.button
      whileHover={!disabled ? { y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ type:'spring', stiffness:400, damping:24 }}
      type={type} disabled={disabled || loading}
      className={cls(
        'inline-flex items-center justify-center gap-2 font-medium select-none focus-ring',
        'disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
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
