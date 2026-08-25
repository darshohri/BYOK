// ─────────────────────────────────────────────
// BYOK — Chat Empty State
// ─────────────────────────────────────────────

import React from 'react';
import { motion } from 'framer-motion';

export default function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Animated cluster icon */}
        <motion.div
          className="mx-auto mb-6 relative w-16 h-16"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Breathing animation */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="relative">
              {/* Central dot */}
              <div className="w-3 h-3 rounded-full bg-purple-400/80 shadow-[0_0_12px_rgba(168,85,247,0.5)]" />
              {/* Orbital dots */}
              {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const x = Math.cos(rad) * 20;
                const y = Math.sin(rad) * 20;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-purple-400/40"
                    style={{
                      left: `calc(50% + ${x}px - 3px)`,
                      top: `calc(50% + ${y}px - 3px)`,
                    }}
                    animate={{
                      opacity: [0.3, 0.7, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: 'easeInOut',
                    }}
                  />
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* Headline */}
        <motion.h2
          className="text-xl font-semibold text-white mb-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          Ready when you are.
        </motion.h2>

        {/* Supporting text */}
        <motion.p
          className="text-[13px] text-neutral-500 leading-relaxed"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          Use Smart Mode or choose a provider manually.
        </motion.p>
      </div>
    </div>
  );
}
