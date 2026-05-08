import { cls } from '../../lib/utils'

export default function Skeleton ({ className }) {
  return (
    <div className={cls(
      'rounded-md bg-white/[.04] relative overflow-hidden',
      'after:absolute after:inset-0 after:animate-shimmer after:bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.06),transparent)] after:bg-[length:400px_100%]',
      className
    )}/>
  )
}
