import { motion } from 'framer-motion'
import { cls } from '../../lib/utils'

const VARIANTS = {
  primary: 'bg-ink-600 text-paper-50 hover:bg-ink-700 border border-ink-600',
  copper:  'bg-copper-300 text-ink-700 hover:bg-copper-400 hover:text-paper-50 border border-copper-300 hover:border-copper-400',
  ghost:   'bg-transparent hover:bg-paper-200/70 text-ink-500 border border-transparent',
  outline: 'bg-paper-50 hover:bg-white text-ink-600 border border-paper-300 hover:border-ink-300',
  danger:  'bg-brick-400 text-paper-50 hover:bg-brick-500 border border-brick-400',
  link:    'bg-transparent text-copper-400 hover:text-copper-500 underline underline-offset-4 decoration-paper-300 hover:decoration-copper-300 px-1 border-0'
}
const SIZES = {
  xs: 'h-7  px-2.5 text-xs',
  sm: 'h-8  px-3   text-[13px]',
  md: 'h-10 px-4   text-sm',
  lg: 'h-11 px-5   text-[14px]'
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
        'inline-flex items-center justify-center gap-2 font-medium select-none focus-ring rounded-md',
        'disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
        SIZES[size], VARIANTS[variant], className
      )}
      {...props}>
      {loading
        ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        : Icon && <Icon className="w-[15px] h-[15px]" />}
      {children}
      {IR && <IR className="w-[15px] h-[15px]" />}
    </motion.button>
  )
}
