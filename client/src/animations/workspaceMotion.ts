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
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

export const reducedWorkspaceCardVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};
