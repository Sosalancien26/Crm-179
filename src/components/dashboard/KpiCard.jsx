import { motion } from 'framer-motion'
import { cls } from '../../lib/utils'
import AnimatedCounter from '../ui/AnimatedCounter'

export default function KpiCard ({ label, value, format='num', icon:Icon, trend, accent='violet', sub, suffix }) {
  const accents = {
    violet: 'from-brand-violet/20 to-brand-blue/10',
    gold:   'from-amber-400/20 to-orange-500/10',
    green:  'from-emerald-400/20 to-teal-500/10',
    rose:   'from-rose-500/20 to-red-500/10',
    blue:   'from-blue-500/20 to-indigo-500/10'
  }[accent]
  const iconBg = {
    violet: 'bg-gradient-primary',
    gold:   'bg-gradient-gold',
    green:  'bg-gradient-to-br from-emerald-400 to-teal-500',
    rose:   'bg-gradient-to-br from-rose-500 to-red-500',
    blue:   'bg-gradient-to-br from-blue-500 to-indigo-500'
  }[accent]
  return (
    <motion.div
      initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:.4, ease:[.21,1.02,.73,1] }}
      whileHover={{ y:-2 }}
      className="card p-5 relative overflow-hidden gradient-border">
      <div className={cls('absolute -top-20 -right-20 w-56 h-56 rounded-full opacity-50 blur-2xl bg-gradient-to-br', accents)} />
      <div className="relative flex items-start justify-between">
        <div className="text-[11px] uppercase tracking-widest text-ink-300">{label}</div>
        {Icon && <div className={cls('w-9 h-9 rounded-xl grid place-items-center shadow-soft', iconBg)}>
          <Icon className="w-4 h-4 text-white"/>
        </div>}
      </div>
      <div className="relative mt-3 text-3xl font-display font-semibold tabular-nums">
        <AnimatedCounter value={value} format={format} suffix={suffix} decimals={format==='pct'?1:0}/>
      </div>
      <div className="relative mt-1 flex items-center gap-2 text-xs text-ink-300">
        {sub && <span>{sub}</span>}
        {trend != null && (
          <span className={cls('px-1.5 py-0.5 rounded font-mono',
            trend >= 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300')}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
    </motion.div>
  )
}
