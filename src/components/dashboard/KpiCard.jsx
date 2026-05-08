import { motion } from 'framer-motion'
import { cls } from '../../lib/utils'
import AnimatedCounter from '../ui/AnimatedCounter'

export default function KpiCard ({ label, value, format='num', icon:Icon, trend, accent='copper', sub, suffix }) {
  const accents = {
    copper:  'from-copper-100 to-copper-50',
    glacier: 'from-glacier-100 to-glacier-50',
    forest:  'from-forest-100 to-forest-50',
    brick:   'from-brick-100 to-brick-50',
    ink:     'from-paper-200 to-paper-100'
  }[accent]
  const iconBg = {
    copper:  'bg-gradient-warm text-paper-50',
    glacier: 'bg-gradient-cool text-paper-50',
    forest:  'bg-forest-400 text-paper-50',
    brick:   'bg-brick-400 text-paper-50',
    ink:     'bg-ink-700 text-paper-50'
  }[accent]
  return (
    <motion.div
      initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:.4, ease:[.21,1.02,.73,1] }}
      whileHover={{ y:-2 }}
      className="card p-5 relative overflow-hidden">
      <div className={cls('absolute -top-12 -right-12 w-44 h-44 rounded-full opacity-60 blur-2xl bg-gradient-to-br', accents)} />
      <div className="relative flex items-start justify-between">
        <div className="eyebrow">{label}</div>
        {Icon && <div className={cls('w-9 h-9 rounded-md grid place-items-center shadow-paper', iconBg)}>
          <Icon className="w-4 h-4"/>
        </div>}
      </div>
      <div className="relative mt-4 num font-display font-semibold text-3xl text-deep">
        <AnimatedCounter value={value} format={format} suffix={suffix} decimals={format==='pct'?1:0}/>
      </div>
      <div className="relative mt-1 flex items-center gap-2 text-xs">
        {sub && <span className="text-soft">{sub}</span>}
        {trend != null && (
          <span className={cls('px-1.5 py-0.5 rounded num',
            trend >= 0 ? 'bg-forest-50 text-forest-500' : 'bg-brick-50 text-brick-500')}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
    </motion.div>
  )
}
