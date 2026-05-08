import { Star } from 'lucide-react'
import { cls } from '../../lib/utils'

export default function StarRating ({ value=0, onChange, readOnly=false, size=18 }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => {
        const filled = n <= value
        return (
          <button key={n} type="button" disabled={readOnly}
            onClick={() => !readOnly && onChange?.(n === value ? 0 : n)}
            className={cls('p-0.5 transition-transform', !readOnly && 'hover:scale-110 cursor-pointer')}>
            <Star size={size}
              className={cls(filled ? 'fill-copper-400 text-copper-400' : 'text-paper-400')} />
          </button>
        )
      })}
    </div>
  )
}
