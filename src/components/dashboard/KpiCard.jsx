import { motion } from 'framer-motion'
import { cls } from '../../lib/utils'
import AnimatedCounter from '../ui/AnimatedCounter'

export default function KpiCard ({ label, value, format='num', icon:Icon, trend, accent='copper', sub, suffix }) {
  return (
    <motion.div
      initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:.4, ease:[.21,1.02,.73,1] }}
      whileHover={{ y:-1 }}
      className="card p-6 relative">
      <div className="flex items-start justify-between mb-5">
        <div className="eyebrow">{label}</div>
        {Icon && <Icon className="w-4 h-4 text-copper-400 shrink-0" />}
      </div>
      <div className="num font-display font-medium text-[34px] text-deep leading-none">
        <AnimatedCounter value={value} format={format} suffix={suffix} decimals={format==='pct'?1:0}/>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        {sub && <span className="text-soft">{sub}</span>}
        {trend != null && (
          <span className={cls('px-1.5 py-0.5 rounded num',
            trend >= 0 ? 'bg-forest-50 text-forest-400' : 'bg-brick-50 text-brick-400')}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
    </motion.div>
  )
}
