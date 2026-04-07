'use client';

import { MotionConfig as MotionConfigComponent } from 'motion/react';

/**
 * Animation duration constants (in seconds)
 * Defines standard durations for different interaction types
 */
export const ANIMATION_DURATIONS = {
  hover: 0.15, // 150ms for hover state transitions
  tap: 0.1, // 100ms for press/tap interactions
  spinner: 1, // 1000ms for full spinner rotation
} as const;

/**
 * Animation easing functions using cubic-bezier values
 * Provides consistent easing across all animations
 */
export const ANIMATION_EASING = {
  easeOut: [0.25, 0.46, 0.45, 0.94], // cubic-bezier(0.25, 0.46, 0.45, 0.94) - smooth deceleration
} as const;

/**
 * Reusable animation variants for consistent motion across components
 * Organized by component type for easy reference
 */
export const ANIMATION_VARIANTS = {
  button: {
    // Hover state: subtle scale increase + shadow elevation
    // Creates visual feedback that the button is interactive
    hover: {
      scale: 1.05,
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    },
    // Tap state: slight scale decrease for "pressed" feel
    // Immediate response to user interaction for perceived responsiveness
    tap: {
      scale: 0.98,
    },
  },
  card: {
    // Hover state: shadow increase for elevation effect
    // Suggests the card is interactive/clickable
    hover: {
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    },
  },
} as const;

/**
 * MotionConfig wrapper component
 * Wraps the application with Motion's MotionConfig provider
 * Automatically respects user's prefers-reduced-motion accessibility setting
 *
 * When `reducedMotion="user"` is set, all Motion animations are automatically
 * disabled if the user has enabled the system-wide "Reduce Motion" preference
 * This ensures WCAG 2.1 Level AAA compliance for motion accessibility
 */
export function MotionConfig({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfigComponent reducedMotion="user">
      {children}
    </MotionConfigComponent>
  );
}
