/**
 * useIncident() Hook
 * API-backed incident state management with localStorage fallback
 * Replaces direct localStorage usage from v1.0
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { IncidentAPI } from './useIncidentAPI';
import { APIError, NetworkError, shouldFallback } from '../api/client';
import {
  Incident,
  CreateIncidentInput,
  UpdateIncidentInput,
  ListIncidentsFilters,
  ListIncidentsResponse,
} from '../lib/incident-types';

// ============================================================================
// localStorage Keys
// ============================================================================

const STORAGE_KEYS = {
  SINGLE_INCIDENT: (id: string) => `siag-incident-${id}`,
  INCIDENTS_LIST: 'siag-incidents',
  FALLBACK_FLAG: 'siag-incident-fallback',
} as const;

// ============================================================================
// Hook Return Type
// ============================================================================

export interface UseIncidentReturn {
  // State
  incident: Incident | null;
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;

  // CRUD Operations
  createIncident: (input: CreateIncidentInput) => Promise<Incident>;
  getIncident: (id: string) => Promise<Incident | null>;
  updateIncident: (id: string, input: UpdateIncidentInput) => Promise<Incident>;
  deleteIncident: (id: string) => Promise<void>;
  listIncidents: (filters?: ListIncidentsFilters) => Promise<Incident[]>;

  // Utilities
  clearError: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get from localStorage, with safe JSON parsing
 */
function getFromStorage<T>(key: string): T | null {
  try {
    if (typeof window === 'undefined') {
      return null;
    }
    const stored = window.localStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored) as T;
  } catch {
    // Corrupted localStorage entry, ignore
    return null;
  }
}

/**
 * Save to localStorage, with safe JSON stringification
 */
function saveToStorage<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage quota exceeded or unavailable, ignore
  }
}

/**
 * Remove from localStorage
 */
function removeFromStorage(key: string): void {
  try {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.removeItem(key);
  } catch {
    // Ignore errors
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Main incident hook with API-first strategy and localStorage fallback
 * Provides CRUD operations, loading states, error handling, and offline detection
 */
export function useIncident(): UseIncidentReturn {
  // State management
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Keep track of abort controller for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Abort any pending requests on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Create a new incident
   */
  const createIncident = useCallback(
    async (input: CreateIncidentInput): Promise<Incident> => {
      setIsLoading(true);
      setError(null);
      setIsOffline(false);

      try {
        const newIncident = await IncidentAPI.createIncident(input);
        setIncident(newIncident);
        return newIncident;
      } catch (err) {
        // Check if we should fall back to localStorage
        if (shouldFallback(err)) {
          setIsOffline(true);
          // Generate temporary ID for offline incidents
          const tempId = `temp-${Date.now()}`;
          const offlineIncident: Incident = {
            ...input,
            id: tempId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          saveToStorage(STORAGE_KEYS.SINGLE_INCIDENT(tempId), offlineIncident);
          setIncident(offlineIncident);
          return offlineIncident;
        }

        // For client errors (4xx), bubble error to UI
        const errorMsg = err instanceof Error ? err.message : 'Failed to create incident';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Fetch incident by ID
   */
  const getIncident = useCallback(
    async (id: string): Promise<Incident | null> => {
      setIsLoading(true);
      setError(null);
      setIsOffline(false);

      try {
        const fetchedIncident = await IncidentAPI.getIncident(id);
        setIncident(fetchedIncident);
        return fetchedIncident;
      } catch (err) {
        // Check if we should fall back to localStorage
        if (shouldFallback(err)) {
          setIsOffline(true);
          const cached = getFromStorage<Incident>(STORAGE_KEYS.SINGLE_INCIDENT(id));
          setIncident(cached);
          return cached;
        }

        // For 404 and other 4xx errors, clear incident and bubble error
        if (err instanceof APIError && err.isClientError()) {
          setIncident(null);
          const errorMsg = err.isNotFound() ? 'Incident not found' : err.message;
          setError(errorMsg);
          throw err;
        }

        // Unknown error
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch incident';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Update incident with partial data
   */
  const updateIncident = useCallback(
    async (id: string, input: UpdateIncidentInput): Promise<Incident> => {
      setIsLoading(true);
      setError(null);
      setIsOffline(false);

      try {
        const updated = await IncidentAPI.updateIncident(id, input);
        setIncident(updated);
        return updated;
      } catch (err) {
        // Check if we should fall back to localStorage
        if (shouldFallback(err)) {
          setIsOffline(true);
          // Update cached incident
          const cached = getFromStorage<Incident>(STORAGE_KEYS.SINGLE_INCIDENT(id));
          if (cached) {
            const merged = {
              ...cached,
              ...input,
              updatedAt: new Date().toISOString(),
            };
            saveToStorage(STORAGE_KEYS.SINGLE_INCIDENT(id), merged);
            setIncident(merged);
            return merged;
          }
          throw new Error('Incident not found in local storage');
        }

        // For client errors, bubble to UI
        const errorMsg = err instanceof Error ? err.message : 'Failed to update incident';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Delete incident (soft delete)
   */
  const deleteIncident = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setIsOffline(false);

    try {
      await IncidentAPI.deleteIncident(id);
      // Clear local state after successful delete
      setIncident(null);
      removeFromStorage(STORAGE_KEYS.SINGLE_INCIDENT(id));
    } catch (err) {
      // Check if we should fall back to localStorage
      if (shouldFallback(err)) {
        setIsOffline(true);
        // Still remove from local storage on fallback
        removeFromStorage(STORAGE_KEYS.SINGLE_INCIDENT(id));
        setIncident(null);
        return;
      }

      // For client errors, bubble to UI
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete incident';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * List all incidents with optional filters
   */
  const listIncidents = useCallback(
    async (filters?: ListIncidentsFilters): Promise<Incident[]> => {
      setIsLoading(true);
      setError(null);
      setIsOffline(false);

      try {
        const response = await IncidentAPI.listIncidents(filters);
        saveToStorage(STORAGE_KEYS.INCIDENTS_LIST, response.data);
        return response.data;
      } catch (err) {
        // Check if we should fall back to localStorage
        if (shouldFallback(err)) {
          setIsOffline(true);
          const cached = getFromStorage<Incident[]>(STORAGE_KEYS.INCIDENTS_LIST);
          if (cached && Array.isArray(cached)) {
            // Apply filters to cached data if needed
            let filtered = cached;
            if (filters?.type) {
              filtered = filtered.filter((i) => i.incident_type === filters.type);
            }
            if (filters?.severity) {
              filtered = filtered.filter((i) => i.severity === filters.severity);
            }
            return filtered;
          }
          return [];
        }

        // For client errors, bubble to UI
        const errorMsg = err instanceof Error ? err.message : 'Failed to list incidents';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    incident,
    isLoading,
    error,
    isOffline,
    createIncident,
    getIncident,
    updateIncident,
    deleteIncident,
    listIncidents,
    clearError,
  };
}
