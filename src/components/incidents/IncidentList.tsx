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
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';

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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            Working offline. Some features may be limited.
          </p>
        </div>
      )}

      {/* Error display */}
      {(error || localError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error || localError}</p>
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
      {isLoading && <LoadingState />}

      {/* Empty state */}
      {!isLoading && incidents.length === 0 && !error && !localError && (
        <EmptyState />
      )}

      {/* Incidents table */}
      {!isLoading && incidents.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Showing {incidents.length} incident{incidents.length !== 1 ? 's' : ''}
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
