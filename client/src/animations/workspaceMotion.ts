import type { Variants } from 'framer-motion';

export const workspaceLayoutTransition = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 30,
  mass: 0.85,
};

export const reducedWorkspaceLayoutTransition = {
  duration: 0.01,
};

export const workspaceCardVariants: Variants = {
  hidden: (rowIndex = 0) => ({
    opacity: 0, y: 12, scale: 0.985,
    transition: { delay: Number(rowIndex) * 0.035 },
  }),
  visible: (rowIndex = 0) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.34, delay: Number(rowIndex) * 0.035, ease: 'easeOut' },
  }),
  exit: {
    opacity: 0, y: -6, scale: 0.985,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

export const workspaceContentVariants: Variants = {
  hidden: { opacity: 0, y: 5 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.24, delay: 0.06, ease: 'easeOut' },
  },
};

export const reducedWorkspaceCardVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.08 } },
  exit: { opacity: 0, transition: { duration: 0.08 } },
};
