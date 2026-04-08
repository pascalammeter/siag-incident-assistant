'use client';

import { motion } from 'motion/react';
import { ANIMATION_VARIANTS, ANIMATION_DURATIONS } from '@/lib/motion-config';
import { LoadingSpinner } from './LoadingSpinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variantClasses = {
  primary: 'bg-navy text-white hover:bg-navy-light',
  secondary: 'bg-white border border-navy text-navy hover:bg-lightgray',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

/**
 * Button Component with Motion Animations
 *
 * Features:
 * - Hover animation: scale 1.05 + shadow elevation (150ms ease-out)
 * - Press/tap animation: scale 0.98 (100ms ease-out)
 * - Supports three variants: primary, secondary, danger
 * - Supports three sizes: sm, md, lg
 * - Optional isLoading prop displays spinner and disables button
 * - CSS :active fallback for environments with reduced-motion enabled
 *
 * Animations automatically respect prefers-reduced-motion via MotionConfig
 * in root layout. When motion is disabled, :active pseudo-class provides
 * feedback instead.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <motion.button
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
      whileTap={{ scale: 0.98 }}
      transition={{
        hover: { duration: ANIMATION_DURATIONS.hover, ease: 'easeOut' },
        tap: { duration: ANIMATION_DURATIONS.tap, ease: 'easeOut' },
      }}
      disabled={isLoading || disabled}
      className={`
        relative font-medium rounded-lg transition-all duration-150 min-h-[44px]
        active:scale-98 active:shadow-sm
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      <span className="flex items-center justify-center gap-2">
        {isLoading && <LoadingSpinner size="sm" />}
        {children}
      </span>
    </motion.button>
  );
}
