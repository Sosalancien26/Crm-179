import { useCountUp } from '../../hooks/useCountUp'
import { fmtNum, fmtEUR } from '../../lib/utils'

export default function AnimatedCounter ({ value, format='num', duration=900, decimals=0, suffix }) {
  const v = useCountUp(value, duration)
  let txt
  if (format === 'eur')      txt = fmtEUR(v)
  else if (format === 'pct') txt = (v*100).toFixed(decimals) + '%'
  else                       txt = fmtNum(v, { maximumFractionDigits: decimals })
  return <span className="font-mono tabular-nums">{txt}{suffix}</span>
}
