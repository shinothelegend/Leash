'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export const antiGravityReveal = {
  hidden: { opacity: 0, y: 40, scale: 0.97, filter: 'blur(4px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    filter: 'blur(0px)',
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } 
  }
};

export const idleFloat = {
  animate: {
    y: [0, -12, 0],
    transition: { repeat: Infinity, duration: 5, ease: "easeInOut" }
  }
};

export function AntiGravity({ children, className, delay = 0 }: { children: ReactNode, className?: string, delay?: number }) {
  return (
    <motion.div
      variants={antiGravityReveal}
      initial="hidden"
      animate="visible"
      className={className}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

export function AntiGravityContainer({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
