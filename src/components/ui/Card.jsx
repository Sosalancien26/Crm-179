import { motion } from 'framer-motion'
import { cls } from '../../lib/utils'

export default function Card ({
  children, className, gradient=false, hover=false, animate=true, ...rest
}) {
  const Comp = animate ? motion.div : 'div'
  const motionProps = animate ? {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: .35, ease: [.21,1.02,.73,1] }
  } : {}
  return (
    <Comp
      {...motionProps}
      whileHover={hover ? { y: -2 } : undefined}
      className={cls(
        'card p-5 relative',
        gradient && 'gradient-border',
        hover    && 'transition-shadow hover:shadow-glow',
        className
      )}
      {...rest}>
      {children}
    </Comp>
  )
}
