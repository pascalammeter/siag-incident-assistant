'use client';

import { motion } from 'motion/react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * LoadingSpinner Component
 * Animated rotating spinner for loading states
 *
 * Features:
 * - Continuous 360° rotation at 1s interval
 * - Three size variants (sm: 16px, md: 24px, lg: 32px)
 * - Uses border-current to inherit text color (respects dark mode)
 * - Automatically respects prefers-reduced-motion setting via MotionConfig
 *
 * Accessibility:
 * When prefers-reduced-motion is enabled, the spinner will not animate
 * but will still be visible (static circle). The motion is disabled at
 * the MotionConfig level in the root layout.
 */
export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1, // 1 second per full rotation
        repeat: Infinity, // Loop indefinitely
        ease: 'linear', // Linear easing for smooth, constant rotation speed
      }}
      className={`inline-block ${sizeClasses[size]} ${className}`}
    >
      {/* Circular spinner using CSS border trick */}
      <div className="w-full h-full border-2 border-current border-t-transparent rounded-full" />
    </motion.div>
  );
}
