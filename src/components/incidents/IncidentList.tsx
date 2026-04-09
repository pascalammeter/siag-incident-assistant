/**
 * Incident List Container Component
 * Main container that orchestrates filtering, sorting, and API integration
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIncident } from '@/hooks/useIncident';
import { Incident, ListIncidentsFilters, IncidentType, Severity } from '@/lib/incident-types';
import { FilterBar } from './FilterBar';
import { IncidentTable } from './IncidentTable';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';

export function IncidentList() {
  const router = useRouter();
  const {
    isLoading,
    error,
    createIncident: _,
    getIncident: __,
    updateIncident: ___,
    deleteIncident,
    listIncidents,
    isOffline,
  } = useIncident();

  // Local state
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filters, setFilters] = useState<{ type?: IncidentType; severity?: Severity }>({});
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'severity'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [localError, setLocalError] = useState<string | null>(null);

  // Fetch incidents on filter/sort change
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLocalError(null);
        const fetchFilters: ListIncidentsFilters = { ...filters };
        const result = await listIncidents(fetchFilters);

        // Sort results locally (in addition to server-side sorting)
        let sorted = [...result];
        if (sortBy === 'date') {
          sorted.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          if (sortOrder === 'desc') sorted.reverse();
        } else if (sortBy === 'type') {
          sorted.sort((a, b) => (a.incident_type || '').localeCompare(b.incident_type || ''));
          if (sortOrder === 'desc') sorted.reverse();
        } else if (sortBy === 'severity') {
          const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          sorted.sort(
            (a, b) =>
              (severityOrder[a.severity as Severity] ?? 999) -
              (severityOrder[b.severity as Severity] ?? 999)
          );
          if (sortOrder === 'desc') sorted.reverse();
        }

        setIncidents(sorted);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load incidents';
        setLocalError(errorMsg);
        setIncidents([]);
      }
    };

    fetchIncidents();
  }, [filters, sortBy, sortOrder, listIncidents]);

  // Event handlers
  const handleFiltersChange = (newFilters: {
    type?: IncidentType;
    severity?: Severity;
  }) => {
    setFilters(newFilters);
  };

  const handleSortChange = (
    newSortBy: 'date' | 'type' | 'severity',
    newSortOrder: 'asc' | 'desc'
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleViewClick = (id: string) => {
    router.push(`/wizard?incident=${id}`);
  };

  const handleExportClick = (id: string) => {
    // Phase 10 feature - stub for now
    console.log('Export not yet implemented:', id);
  };

  const handleDeleteClick = async (id: string) => {
    try {
      await deleteIncident(id);
      // Remove from local list
      setIncidents((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete incident';
      setLocalError(errorMsg);
    }
  };

  // Render
  return (
    <div className="space-y-6">
      {/* Offline indicator */}
      {isOffline && (
        <div className="bg-amber/10 border border-amber/40 rounded-lg p-4">
          <p className="text-navy dark:text-white text-sm font-medium">
            Offline-Modus — einige Funktionen sind eingeschränkt.
          </p>
        </div>
      )}

      {/* Error display */}
      {(error || localError) && (
        <div className="bg-siag-red/10 border border-siag-red/30 rounded-lg p-4">
          <p className="text-siag-red text-sm font-medium">{error || localError}</p>
        </div>
      )}

      {/* Filter bar */}
      {!isLoading && incidents.length > 0 && (
        <FilterBar
          filters={filters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onFiltersChange={handleFiltersChange}
          onSortChange={handleSortChange}
        />
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && incidents.length === 0 && !error && !localError && (
        <EmptyState />
      )}

      {/* Incidents table */}
      {!isLoading && incidents.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-slate-400">
            {incidents.length} {incidents.length === 1 ? 'Incident' : 'Incidents'} gefunden
          </div>
          <IncidentTable
            incidents={incidents}
            onViewClick={handleViewClick}
            onExportClick={handleExportClick}
            onDeleteClick={handleDeleteClick}
          />
        </div>
      )}
    </div>
  );
}
