import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const parseUseCases = (useCases) => {
  if (Array.isArray(useCases)) {
    return useCases.filter((item) => typeof item === 'string' && item.trim().length > 0);
  }

  if (typeof useCases === 'string' && useCases.trim()) {
    try {
      const parsed = JSON.parse(useCases);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === 'string' && item.trim().length > 0);
      }
    } catch {
      return [];
    }
  }

  return [];
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function UseCasePills({ useCases, limit = null, className = '' }) {
  const pills = useMemo(() => {
    const parsed = parseUseCases(useCases);
    if (!parsed.length) return [];
    return typeof limit === 'number' ? parsed.slice(0, limit) : parsed;
  }, [useCases, limit]);

  if (!pills.length) return null;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className={`w-full overflow-x-auto scrollbar-hide md:overflow-visible ${className}`.trim()}
    >
      <div className="flex flex-nowrap gap-2 min-w-max md:min-w-0 md:flex-wrap md:max-h-[56px] md:overflow-hidden">
        {pills.map((pill) => (
          <motion.span
            key={pill}
            variants={itemVariants}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="inline-flex items-center rounded-full border border-[#3a3a3a] bg-[#1c1c1c] px-2.5 py-1 text-[11px] uppercase tracking-[0.06em] text-[#a8c5a0] whitespace-nowrap"
          >
            {pill}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
