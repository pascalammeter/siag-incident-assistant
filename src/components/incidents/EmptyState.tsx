/**
 * Empty State Component
 * Displayed when no incidents exist
 */

'use client';

import Link from 'next/link';

export function EmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-5xl mb-4">📭</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">No incidents yet</h2>
      <p className="text-gray-600 mb-6">
        All of your security incidents will appear here once created.
      </p>
      <Link
        href="/wizard"
        className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors"
      >
        Create your first incident
      </Link>
      <p className="text-gray-500 mt-4 text-sm">
        Start your first incident response workflow
      </p>
    </div>
  );
}
