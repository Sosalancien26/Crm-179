import { motion } from 'framer-motion'
import { cls } from '../../lib/utils'

export default function Card ({ children, className, hover=false, animate=true, ...rest }) {
  const Comp = animate ? motion.div : 'div'
  const motionProps = animate ? {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: .3, ease: [.21,1.02,.73,1] }
  } : {}
  return (
    <Comp
      {...motionProps}
      whileHover={hover ? { y: -1 } : undefined}
      className={cls('card p-5 relative', hover && 'transition-shadow hover:shadow-page', className)}
      {...rest}>
      {children}
    </Comp>
  )
}
