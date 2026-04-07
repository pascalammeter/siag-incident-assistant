'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { Incident } from '@/lib/incident-types';

export interface IncidentActionsProps {
  incident: Incident;
  onDelete?: (id: string) => Promise<void>;
}

/**
 * IncidentActions Component
 * Displays action buttons for incident management including PDF export.
 * Shows LoadingSpinner during PDF generation and handles errors gracefully.
 *
 * Features:
 * - PDF download button with loading state
 * - LoadingSpinner displays during export
 * - Error message display if export fails
 * - Optional delete button with callback
 * - Disabled state while exporting to prevent double-click
 */
export function IncidentActions({ incident, onDelete }: IncidentActionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle PDF export button click.
   * Fetches PDF from API endpoint, creates a download link, and triggers browser download.
   */
  const handleExportPDF = async () => {
    setIsExporting(true);
    setError(null);

    try {
      // Fetch PDF from Express API endpoint
      const response = await fetch(`/api/incidents/${incident.id}/export/pdf`, {
        method: 'POST',
      });

      if (!response.ok) {
        let errorMessage = 'Failed to export PDF';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Set filename with incident ID and date
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `incident-${incident.id}-${dateStr}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Error message display */}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-3 rounded">
          Error: {error}
        </div>
      )}

      {/* Action buttons container */}
      <div className="flex items-center gap-3">
        {/* Show spinner while exporting */}
        {isExporting && <LoadingSpinner size="sm" />}

        {/* Download PDF button */}
        <Button
          onClick={handleExportPDF}
          disabled={isExporting}
          variant="primary"
          className="flex items-center gap-2"
        >
          {isExporting ? 'Exporting PDF...' : 'Download PDF'}
        </Button>

        {/* Optional delete button */}
        {onDelete && (
          <Button
            onClick={() => onDelete(incident.id)}
            disabled={isExporting}
            variant="danger"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
