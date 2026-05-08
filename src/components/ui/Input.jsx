import { forwardRef } from 'react'
import { cls } from '../../lib/utils'

const Input = forwardRef(function Input ({
  label, hint, error, icon:Icon, className, wrapperClass, ...props
}, ref) {
  return (
    <div className={cls('flex flex-col gap-1.5', wrapperClass)}>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />}
        <input ref={ref}
          className={cls('input-base', Icon && 'pl-9', error && 'border-rose-500/60', className)}
          {...props} />
      </div>
      {error
        ? <span className="text-xs text-rose-400">{error}</span>
        : hint && <span className="text-xs text-ink-300/80">{hint}</span>}
    </div>
  )
})
export default Input

export const Textarea = forwardRef(function Textarea ({
  label, rows=3, error, className, wrapperClass, ...props
}, ref) {
  return (
    <div className={cls('flex flex-col gap-1.5', wrapperClass)}>
      {label && <label className="label">{label}</label>}
      <textarea ref={ref} rows={rows}
        className={cls('input-base resize-none', error && 'border-rose-500/60', className)}
        {...props} />
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  )
})
