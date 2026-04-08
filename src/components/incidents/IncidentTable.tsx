/**
 * Incident Table Component
 * Displays incidents in table format with columns and actions
 */

'use client';

import {
  Incident,
  getIncidentTypeLabel,
  getSeverityLabel,
  getIncidentTypeIcon,
  getSeverityIcon,
} from '@/lib/incident-types';
import { IncidentActions } from './IncidentActions';

export interface IncidentTableProps {
  incidents: Incident[];
  isLoading?: boolean;
  onViewClick: (id: string) => void;
  onExportClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
}

/**
 * Helper: Infer incident status from data
 */
function getIncidentStatus(incident: Incident): 'Draft' | 'In Progress' | 'Completed' {
  if (!incident.incident_type) {
    return 'Draft';
  }

  // Check if playbook is complete
  const playbook = incident.playbook as any;
  if (playbook?.status === 'completed') {
    return 'Completed';
  }

  return 'In Progress';
}

/**
 * Helper: Format date for display
 */
function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}

/**
 * Helper: Truncate title to 50 chars
 */
function getTruncatedTitle(incident: Incident): string {
  const baseTitle = incident.erkennungszeitpunkt || incident.erkannt_durch || 'Untitled';
  const title = String(baseTitle);
  return title.length > 50 ? title.substring(0, 50) + '...' : title;
}

/**
 * Table Row Component
 */
function IncidentTableRow({
  incident,
  onViewClick,
  onExportClick,
  onDeleteClick,
}: {
  incident: Incident;
  onViewClick: (id: string) => void;
  onExportClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
}) {
  const status = getIncidentStatus(incident);
  const incidentTypeLabel = incident.incident_type
    ? getIncidentTypeLabel(incident.incident_type)
    : '-';
  const severityLabel = incident.severity ? getSeverityLabel(incident.severity) : '-';
  const incidentTypeIcon = incident.incident_type
    ? getIncidentTypeIcon(incident.incident_type)
    : '';
  const severityIcon = incident.severity ? getSeverityIcon(incident.severity) : '';

  // Severity colors
  const severityColorMap: Record<string, string> = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  const severityBgColor = incident.severity ? severityColorMap[incident.severity] : 'bg-gray-100 text-gray-800';

  // Type colors
  const typeColorMap: Record<string, string> = {
    ransomware: 'bg-red-100 text-red-800',
    phishing: 'bg-blue-100 text-blue-800',
    ddos: 'bg-purple-100 text-purple-800',
    data_loss: 'bg-yellow-100 text-yellow-800',
    other: 'bg-gray-100 text-gray-800',
  };

  const typeBgColor = incident.incident_type ? typeColorMap[incident.incident_type] : 'bg-gray-100 text-gray-800';

  return (
    <tr
      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
      onClick={() => onViewClick(incident.id)}
    >
      <td className="px-4 py-3 text-sm text-gray-900 cursor-pointer">
        {formatDate(incident.createdAt)}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${typeBgColor}`}>
          {incidentTypeIcon} {incidentTypeLabel}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${severityBgColor}`}>
          {severityIcon} {severityLabel}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
        {getTruncatedTitle(incident)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">{status}</td>
      <td className="px-4 py-3">
        <IncidentActions
          incidentId={incident.id}
          onViewClick={() => onViewClick(incident.id)}
          onExportClick={() => onExportClick(incident.id)}
          onDeleteClick={() => onDeleteClick(incident.id)}
        />
      </td>
    </tr>
  );
}

export function IncidentTable({
  incidents,
  isLoading: _isLoading,
  onViewClick,
  onExportClick,
  onDeleteClick,
}: IncidentTableProps) {
  if (incidents.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Severity</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Title</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <IncidentTableRow
              key={incident.id}
              incident={incident}
              onViewClick={onViewClick}
              onExportClick={onExportClick}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
