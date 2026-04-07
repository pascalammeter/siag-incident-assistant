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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Alle Vorfälle</h1>
          <p className="text-gray-600 mt-1">
            Übersicht aller erfassten Sicherheitsvorfälle
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <IncidentList />
      </main>
    </div>
  );
}
