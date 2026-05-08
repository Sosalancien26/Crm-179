import { cls, hexToRgba } from '../../lib/utils'

export default function Badge ({ children, color, className, size='sm', dot=false }) {
  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1'
  }[size]
  const style = color ? {
    backgroundColor: hexToRgba(color, .14),
    color,
    boxShadow: `inset 0 0 0 1px ${hexToRgba(color, .35)}`
  } : undefined
  return (
    <span style={style}
      className={cls('inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
        !color && 'bg-white/10 text-ink-100', sizes, className)}>
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: color || 'currentColor' }} />}
      {children}
    </span>
  )
}
