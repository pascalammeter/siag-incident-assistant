/**
 * Incident List Page
 * Route: /incidents
 * Displays all stored incidents with filtering, sorting, and action handlers
 */

import { IncidentList } from '@/components/incidents/IncidentList';

export const metadata = {
  title: 'Incidents — SIAG Incident Assistant',
  description: 'Manage and track all security incidents',
};

export default function IncidentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Alle Vorfälle</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">
          Übersicht aller erfassten Sicherheitsvorfälle
        </p>
      </div>
      <IncidentList />
    </div>
  );
}
