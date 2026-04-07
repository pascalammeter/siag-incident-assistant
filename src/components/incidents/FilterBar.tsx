/**
 * Filter Bar Component
 * Provides type, severity, and sort controls for incident list
 */

'use client';

import { IncidentType, Severity } from '@/lib/incident-types';

export interface FilterBarProps {
  filters: { type?: IncidentType; severity?: Severity };
  sortBy: 'date' | 'type' | 'severity';
  sortOrder: 'asc' | 'desc';
  onFiltersChange: (filters: { type?: IncidentType; severity?: Severity }) => void;
  onSortChange: (sortBy: 'date' | 'type' | 'severity', sortOrder: 'asc' | 'desc') => void;
}

export function FilterBar({
  filters,
  sortBy,
  sortOrder,
  onFiltersChange,
  onSortChange,
}: FilterBarProps) {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as IncidentType | '';
    onFiltersChange({
      ...filters,
      type: newType ? newType : undefined,
    });
  };

  const handleSeverityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSeverity = e.target.value as Severity | '';
    onFiltersChange({
      ...filters,
      severity: newSeverity ? newSeverity : undefined,
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'date-desc') {
      onSortChange('date', 'desc');
    } else if (value === 'date-asc') {
      onSortChange('date', 'asc');
    } else if (value === 'type-asc') {
      onSortChange('type', 'asc');
    } else if (value === 'severity-desc') {
      onSortChange('severity', 'desc');
    }
  };

  const sortValue =
    sortBy === 'date'
      ? sortOrder === 'desc'
        ? 'date-desc'
        : 'date-asc'
      : sortBy === 'type'
        ? 'type-asc'
        : 'severity-desc';

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Incident Type
          </label>
          <select
            value={filters.type || ''}
            onChange={handleTypeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
          >
            <option value="">All Types</option>
            <option value="ransomware">Ransomware</option>
            <option value="phishing">Phishing</option>
            <option value="ddos">DDoS</option>
            <option value="data_loss">Data Loss</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Severity
          </label>
          <select
            value={filters.severity || ''}
            onChange={handleSeverityChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Sort Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={sortValue}
            onChange={handleSortChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
          >
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="type-asc">Type (A-Z)</option>
            <option value="severity-desc">Severity (Critical → Low)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
