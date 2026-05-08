import { cls } from '../../lib/utils'

export default function Empty ({ icon:Icon, title, hint, action, className }) {
  return (
    <div className={cls('flex flex-col items-center justify-center text-center py-16 px-6', className)}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-white/[.04] border border-white/[.06] grid place-items-center mb-4">
          <Icon className="w-6 h-6 text-ink-300" />
        </div>
      )}
      <div className="font-display text-lg">{title}</div>
      {hint && <div className="text-sm text-ink-300 mt-1 max-w-md">{hint}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
