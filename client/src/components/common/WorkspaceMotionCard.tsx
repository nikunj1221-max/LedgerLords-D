import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, type Transition } from 'framer-motion';
import {
  reducedWorkspaceCardVariants,
  workspaceCardVariants,
} from '../../animations/workspaceMotion';

interface WorkspaceMotionCardProps {
  componentId: string;
  scrollRoot: React.RefObject<HTMLElement>;
  staggerIndex: number;
  layoutTransition: Transition;
  className: string;
  children: React.ReactNode;
}

/**
 * Keeps visibility state on the same keyed element that owns layout animation.
 * Cards reveal once when they enter the workspace scroller; existing IDs remain
 * mounted when a plan changes, allowing Framer Motion to FLIP their new layout.
 */
export const WorkspaceMotionCard = React.forwardRef<HTMLDivElement, WorkspaceMotionCardProps>(({
  componentId,
  scrollRoot,
  staggerIndex,
  layoutTransition,
  className,
  children,
}, forwardedRef) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = Boolean(prefersReducedMotion);
  const setCardRef = useCallback((node: HTMLDivElement | null) => {
    cardRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef]);

  useEffect(() => {
    const node = cardRef.current;
    const root = scrollRoot.current;
    if (!node) return;
    if (reducedMotion || !root || typeof IntersectionObserver === 'undefined') {
      setHasEnteredView(true);
      return;
    }

    let observer: IntersectionObserver | undefined;
    // New plans can place cards while the first FLIP/grid measurement is still
    // settling. Observe after that pass so its pre-layout box cannot consume
    // the one-shot reveal before the card reaches the viewport.
    const startObserver = window.setTimeout(() => {
      if (!cardRef.current) return;
      observer = new IntersectionObserver(([entry]) => {
        const cardRect = node.getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();
        const clipTop = rootRect.top + root.clientTop;
        const clipLeft = rootRect.left + root.clientLeft;
        const visibleWidth = Math.max(0, Math.min(cardRect.right, clipLeft + root.clientWidth) - Math.max(cardRect.left, clipLeft));
        const visibleHeight = Math.max(0, Math.min(cardRect.bottom, clipTop + root.clientHeight) - Math.max(cardRect.top, clipTop));
        const visibleRatio = (visibleWidth * visibleHeight) / Math.max(1, cardRect.width * cardRect.height);

        if (entry.isIntersecting && visibleRatio >= 0.12) {
          setHasEnteredView(true);
          observer?.unobserve(node);
        }
      }, { root, threshold: [0, 0.12] });

      observer.observe(node);
    }, 350);

    return () => {
      window.clearTimeout(startObserver);
      observer?.disconnect();
    };
  }, [componentId, reducedMotion, scrollRoot]);

  return (
    <motion.div
      ref={setCardRef}
      id={`workspace-component-${componentId}`}
      layout
      custom={staggerIndex}
      variants={reducedMotion ? reducedWorkspaceCardVariants : workspaceCardVariants}
      initial={reducedMotion ? 'visible' : 'hidden'}
      animate={reducedMotion || hasEnteredView ? 'visible' : 'hidden'}
      exit="exit"
      transition={{ layout: layoutTransition }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

WorkspaceMotionCard.displayName = 'WorkspaceMotionCard';
