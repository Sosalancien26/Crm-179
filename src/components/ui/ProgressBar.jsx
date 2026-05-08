import { motion } from 'framer-motion'
import { cls } from '../../lib/utils'

export default function ProgressBar ({ value=0, label, className }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  return (
    <div className={cls('w-full', className)}>
      {label && <div className="flex items-center justify-between text-xs text-mute mb-1">
        <span>{label}</span><span className="num text-ink-700">{Math.round(pct)}%</span>
      </div>}
      <div className="h-2 rounded-full bg-paper-200 overflow-hidden">
        <motion.div className="h-full bg-gradient-warm rounded-full"
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: .9, ease: [.21,1.02,.73,1] }} />
      </div>
    </div>
  )
}

export function ProgressCircle ({ value=0, size=88, stroke=8, label, sub }) {
  const pct = Math.max(0, Math.min(1, value))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const off = c - pct * c
  return (
    <div className="relative" style={{ width:size, height:size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="pc" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%"  stopColor="#B8651D" />
            <stop offset="100%" stopColor="#9C5217" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(60,50,30,.10)" strokeWidth={stroke} fill="none"/>
        <motion.circle cx={size/2} cy={size/2} r={r} stroke="url(#pc)" strokeWidth={stroke}
          fill="none" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset:c }}
          animate={{ strokeDashoffset:off }}
          transition={{ duration:1.1, ease:[.21,1.02,.73,1] }}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="num font-semibold text-ink-700 text-sm">{label ?? `${Math.round(pct*100)}%`}</div>
        {sub && <div className="text-[9px] text-soft uppercase tracking-editorial">{sub}</div>}
      </div>
    </div>
  )
}
