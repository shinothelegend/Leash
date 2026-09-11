'use client';

import { motion } from 'framer-motion';
import { idleFloat } from './AntiGravity';

export function LeashMotif() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-[0.25]">
      <motion.div 
        variants={idleFloat}
        animate="animate"
        className="absolute top-1/4 -right-1/4 w-[150vw] h-[150vh]"
      >
        <svg viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_50px_rgba(66,140,212,0.9)]">
          <path d="M -200 800 C 100 800, 300 100, 600 300 C 900 500, 800 200, 1100 100 C 1300 0, 1400 200, 1300 300 C 1200 400, 1000 300, 1000 150 C 1000 50, 1150 0, 1250 100" stroke="url(#leashGrad)" strokeWidth="6" strokeLinecap="round"/>
          <defs>
            <linearGradient id="leashGrad" x1="-200" y1="800" x2="1250" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--blue-deep)" />
              <stop offset="50%" stopColor="var(--blue-bright)" />
              <stop offset="100%" stopColor="var(--pink-soft)" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}
