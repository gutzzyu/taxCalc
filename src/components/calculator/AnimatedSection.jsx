import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnimatedSection({ children, keyProp, direction = 'up' }) {
  const variants = {
    initial: {
      opacity: 0,
      y: direction === 'up' ? 24 : -24,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.08,
      },
    },
    exit: {
      opacity: 0,
      y: direction === 'up' ? -16 : 16,
      scale: 0.98,
      transition: { duration: 0.25 },
    },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyProp}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function StaggerChild({ children, className }) {
  return (
    <motion.div
      className={className}
      variants={{
        initial: { opacity: 0, y: 16 },
        animate: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, ease: 'easeOut' },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
