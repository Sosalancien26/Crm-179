import { cls } from '../../lib/utils'

export default function Empty ({ icon:Icon, title, hint, action, className }) {
  return (
    <div className={cls('flex flex-col items-center justify-center text-center py-16 px-6', className)}>
      {Icon && (
        <div className="w-14 h-14 rounded-lg bg-paper-100 border border-paper-300 grid place-items-center mb-4">
          <Icon className="w-6 h-6 text-mute" />
        </div>
      )}
      <div className="font-display text-xl text-deep">{title}</div>
      {hint && <div className="text-sm text-mute mt-1 max-w-md font-serif leading-relaxed">{hint}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
