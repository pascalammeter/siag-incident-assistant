/**
 * Component unit tests for incident list components
 * Tests rendering, filtering, sorting, and user interactions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IncidentTable } from '../../../src/components/incidents/IncidentTable';
import { FilterBar } from '../../../src/components/incidents/FilterBar';
import { IncidentActions } from '../../../src/components/incidents/IncidentActions';
import { EmptyState } from '../../../src/components/incidents/EmptyState';
import { LoadingState } from '../../../src/components/incidents/LoadingState';
import { Incident } from '../../../src/lib/incident-types';

// ============================================================================
// Test Fixtures
// ============================================================================

const mockIncidents: Incident[] = [
  {
    id: 'incident-1',
    createdAt: '2026-04-07T14:30:00Z',
    updatedAt: '2026-04-07T14:30:00Z',
    incident_type: 'ransomware',
    severity: 'critical',
    erkannt_durch: 'Admin User',
    playbook: { status: 'in_progress' },
  },
  {
    id: 'incident-2',
    createdAt: '2026-04-06T10:00:00Z',
    updatedAt: '2026-04-06T10:00:00Z',
    incident_type: 'phishing',
    severity: 'high',
    erkannt_durch: 'Alert System',
    playbook: { status: 'completed' },
  },
];

// ============================================================================
// Tests: IncidentTable
// ============================================================================

describe('IncidentTable', () => {
  it('should render table with incident rows', () => {
    const mockHandlers = {
      onViewClick: vi.fn(),
      onExportClick: vi.fn(),
      onDeleteClick: vi.fn(),
    };

    render(
      <IncidentTable
        incidents={mockIncidents}
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/Admin User/i)).toBeTruthy();
    expect(screen.getByText(/Alert System/i)).toBeTruthy();
  });

  it('should show correct incident type badge', () => {
    const mockHandlers = {
      onViewClick: vi.fn(),
      onExportClick: vi.fn(),
      onDeleteClick: vi.fn(),
    };

    render(
      <IncidentTable
        incidents={[mockIncidents[0]]}
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/Ransomware/i)).toBeTruthy();
  });

  it('should show correct severity badge', () => {
    const mockHandlers = {
      onViewClick: vi.fn(),
      onExportClick: vi.fn(),
      onDeleteClick: vi.fn(),
    };

    render(
      <IncidentTable
        incidents={[mockIncidents[0]]}
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/Critical/i)).toBeTruthy();
  });

  it('should handle empty incidents', () => {
    const mockHandlers = {
      onViewClick: vi.fn(),
      onExportClick: vi.fn(),
      onDeleteClick: vi.fn(),
    };

    const { container } = render(
      <IncidentTable
        incidents={[]}
        {...mockHandlers}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});

// ============================================================================
// Tests: FilterBar
// ============================================================================

describe('FilterBar', () => {
  it('should render type dropdown', () => {
    render(
      <FilterBar
        filters={{}}
        sortBy="date"
        sortOrder="desc"
        onFiltersChange={vi.fn()}
        onSortChange={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('All Types')).toBeTruthy();
  });

  it('should render severity dropdown', () => {
    render(
      <FilterBar
        filters={{}}
        sortBy="date"
        sortOrder="desc"
        onFiltersChange={vi.fn()}
        onSortChange={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('All Severities')).toBeTruthy();
  });

  it('should call onFiltersChange when type selected', () => {
    const mockOnFiltersChange = vi.fn();

    render(
      <FilterBar
        filters={{}}
        sortBy="date"
        sortOrder="desc"
        onFiltersChange={mockOnFiltersChange}
        onSortChange={vi.fn()}
      />
    );

    const typeSelect = screen.getByDisplayValue('All Types') as HTMLSelectElement;
    fireEvent.change(typeSelect, { target: { value: 'ransomware' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ransomware' })
    );
  });

  it('should call onSortChange when sort selected', () => {
    const mockOnSortChange = vi.fn();

    render(
      <FilterBar
        filters={{}}
        sortBy="date"
        sortOrder="desc"
        onFiltersChange={vi.fn()}
        onSortChange={mockOnSortChange}
      />
    );

    const sortSelect = screen.getByDisplayValue('Date (Newest)') as HTMLSelectElement;
    fireEvent.change(sortSelect, { target: { value: 'date-asc' } });

    expect(mockOnSortChange).toHaveBeenCalledWith('date', 'asc');
  });
});

// ============================================================================
// Tests: IncidentActions
// ============================================================================

describe('IncidentActions', () => {
  it('should render View button', () => {
    render(
      <IncidentActions
        incidentId="test-id"
        onViewClick={vi.fn()}
        onExportClick={vi.fn()}
        onDeleteClick={vi.fn()}
      />
    );

    expect(screen.getByText('View')).toBeTruthy();
  });

  it('should render disabled Export button', () => {
    render(
      <IncidentActions
        incidentId="test-id"
        onViewClick={vi.fn()}
        onExportClick={vi.fn()}
        onDeleteClick={vi.fn()}
      />
    );

    const exportBtn = screen.getByText('Export') as HTMLButtonElement;
    expect(exportBtn.disabled).toBe(true);
  });

  it('should call onViewClick when View clicked', () => {
    const mockViewClick = vi.fn();

    render(
      <IncidentActions
        incidentId="test-id"
        onViewClick={mockViewClick}
        onExportClick={vi.fn()}
        onDeleteClick={vi.fn()}
      />
    );

    const viewBtn = screen.getByText('View');
    fireEvent.click(viewBtn);

    expect(mockViewClick).toHaveBeenCalled();
  });

  it('should show delete confirmation modal', () => {
    render(
      <IncidentActions
        incidentId="test-id"
        onViewClick={vi.fn()}
        onExportClick={vi.fn()}
        onDeleteClick={vi.fn()}
      />
    );

    const deleteBtn = screen.getByText('Delete');
    fireEvent.click(deleteBtn);

    expect(screen.getByText('Delete incident?')).toBeTruthy();
  });

  it('should call onDeleteClick after confirmation', () => {
    const mockDeleteClick = vi.fn();

    render(
      <IncidentActions
        incidentId="test-id"
        onViewClick={vi.fn()}
        onExportClick={vi.fn()}
        onDeleteClick={mockDeleteClick}
      />
    );

    const deleteBtn = screen.getByText('Delete');
    fireEvent.click(deleteBtn);

    const confirmBtns = screen.getAllByText('Delete');
    const confirmBtn = confirmBtns[1]; // Second Delete button is in modal
    fireEvent.click(confirmBtn);

    expect(mockDeleteClick).toHaveBeenCalled();
  });
});

// ============================================================================
// Tests: EmptyState
// ============================================================================

describe('EmptyState', () => {
  it('should render empty state message', () => {
    render(<EmptyState />);

    expect(screen.getByText('No incidents yet')).toBeTruthy();
  });

  it('should render create incident link', () => {
    render(<EmptyState />);

    expect(screen.getByText(/Create your first incident/i)).toBeTruthy();
  });
});

// ============================================================================
// Tests: LoadingState
// ============================================================================

describe('LoadingState', () => {
  it('should render loading message', () => {
    render(<LoadingState />);

    expect(screen.getByText('Loading incidents...')).toBeTruthy();
  });

  it('should render skeleton loaders', () => {
    const { container } = render(<LoadingState />);

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
