import { forwardRef } from 'react'
import { cls } from '../../lib/utils'

const Select = forwardRef(function Select ({
  label, options=[], placeholder='Sélectionner…', className, wrapperClass, allowEmpty=true, ...props
}, ref) {
  return (
    <div className={cls('flex flex-col gap-1.5', wrapperClass)}>
      {label && <label className="label">{label}</label>}
      <select ref={ref} className={cls('input-base appearance-none bg-[length:14px] bg-no-repeat bg-[right_12px_center] pr-9',
        'bg-[url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2714%27 height=%2714%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23B8B8CC%27 stroke-width=%272%27><polyline points=%276 9 12 15 18 9%27/></svg>")]',
        className)} {...props}>
        {allowEmpty && <option value="">{placeholder}</option>}
        {options.map(o => {
          const v = typeof o === 'string' ? o : o.valeur
          const l = typeof o === 'string' ? o : (o.label || o.valeur)
          return <option key={v} value={v}>{l}</option>
        })}
      </select>
    </div>
  )
})
export default Select
