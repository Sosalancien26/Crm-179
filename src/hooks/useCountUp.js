import { useEffect, useState } from 'react'

/** Compteur animé easeOut. */
export function useCountUp (target, duration=900) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf, start
    const from = 0
    const to = Number(target||0)
    const step = (ts) => {
      if (!start) start = ts
      const t = Math.min(1, (ts - start)/duration)
      const eased = 1 - Math.pow(1-t, 3)
      setV(from + (to-from)*eased)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return v
}
