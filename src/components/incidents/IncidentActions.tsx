/**
 * Incident Actions Component
 * Provides View, Export, and Delete action buttons for each incident
 */

'use client';

import { useState } from 'react';

export interface IncidentActionsProps {
  incidentId: string;
  isExporting?: boolean;
  onViewClick: () => void;
  onExportClick: () => void;
  onDeleteClick: () => void;
}

/**
 * Delete Confirmation Modal
 */
function DeleteConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete incident?</h3>
        <p className="text-gray-600 mb-6">This action cannot be undone.</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function IncidentActions({
  incidentId: _incidentId,
  isExporting = false,
  onViewClick,
  onExportClick,
  onDeleteClick,
}: IncidentActionsProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteConfirm = () => {
    setShowDeleteModal(false);
    onDeleteClick();
  };

  return (
    <>
      <div className="flex gap-2">
        {/* View Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewClick();
          }}
          className="px-3 py-1 bg-slate-900 text-white text-xs rounded hover:bg-slate-800 transition-colors"
          title="View and edit incident"
        >
          View
        </button>

        {/* Export Button */}
        <button
          disabled={isExporting}
          onClick={(e) => {
            e.stopPropagation();
            onExportClick();
          }}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            isExporting
              ? 'bg-gray-300 text-gray-600 opacity-50 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          title={isExporting ? 'Exporting PDF...' : 'Export as PDF'}
        >
          {isExporting ? (
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Exporting
            </span>
          ) : (
            'Export'
          )}
        </button>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteModal(true);
          }}
          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
          title="Delete incident"
        >
          Delete
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}
