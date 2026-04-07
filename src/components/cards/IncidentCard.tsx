'use client';

import { motion } from 'motion/react';
import { Incident } from '@/lib/incident-types';

export interface IncidentCardProps {
  incident: Incident;
  onClick?: () => void;
}

/**
 * IncidentCard Component
 * Displays a single incident with hover elevation animation
 *
 * Features:
 * - Smooth shadow elevation on hover (0 to 0 20px 40px rgba(0,0,0,0.15))
 * - 150ms ease-out transition for smooth visual feedback
 * - Dark mode compatible with appropriate shadows
 * - Cursor changes to pointer on hover to indicate interactivity
 *
 * Accessibility:
 * Motion automatically respects prefers-reduced-motion via MotionConfig
 */
export function IncidentCard({ incident, onClick }: IncidentCardProps) {
  return (
    <motion.div
      initial={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
      whileHover={{ boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={onClick}
      className="p-4 bg-white dark:bg-slate-900 rounded-lg cursor-pointer transition-colors"
    >
      {/* Card content can be extended here */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          {incident.erkannt_durch || 'Untitled'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Type: {incident.incident_type || 'Unknown'}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Severity: {incident.severity || 'Not set'}
        </p>
        <time className="text-xs text-gray-500 dark:text-gray-500">
          {incident.createdAt
            ? new Date(incident.createdAt).toLocaleString()
            : 'No date'}
        </time>
      </div>
    </motion.div>
  );
}
