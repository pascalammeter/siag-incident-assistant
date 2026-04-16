/**
 * API Service Layer for Incident Operations
 * Wraps HTTP client calls with incident-specific logic
 * Separates API concerns from hook state management
 */

import { apiClient } from '../api/client';
import {
  Incident,
  CreateIncidentInput,
  UpdateIncidentInput,
  ListIncidentsFilters,
  ListIncidentsResponse,
} from '../lib/incident-types';

/**
 * IncidentAPI service class with static methods for all CRUD operations
 * Each method uses apiClient for HTTP calls and returns properly typed responses
 */
export class IncidentAPI {
  /**
   * Create a new incident
   * POST /api/incidents
   *
   * @param input - Incident data (incident_type and severity required)
   * @returns Full incident object with ID, timestamps, etc.
   * @throws APIError if validation fails (400) or server error (5xx)
   */
  static async createIncident(input: CreateIncidentInput): Promise<Incident> {
    return apiClient.post<Incident>('/api/incidents', input);
  }

  /**
   * Fetch incident by ID
   * GET /api/incidents/{id}
   *
   * @param id - Incident UUID
   * @returns Full incident object
   * @throws APIError with status 404 if not found
   * @throws APIError if server error (5xx)
   */
  static async getIncident(id: string): Promise<Incident> {
    const incident = await apiClient.get<Incident>(`/api/incidents/${id}`);
    return incident;
  }

  /**
   * Update incident with partial data
   * PATCH /api/incidents/{id}
   *
   * @param id - Incident UUID
   * @param input - Partial incident data (all fields optional)
   * @returns Updated incident object
   * @throws APIError with status 404 if not found
   * @throws APIError if validation fails (400) or server error (5xx)
   */
  static async updateIncident(id: string, input: UpdateIncidentInput): Promise<Incident> {
    return apiClient.patch<Incident>(`/api/incidents/${id}`, input);
  }

  /**
   * Delete incident (soft delete)
   * DELETE /api/incidents/{id}
   *
   * @param id - Incident UUID
   * @returns void (204 No Content response)
   * @throws APIError with status 404 if not found
   * @throws APIError if server error (5xx)
   */
  static async deleteIncident(id: string): Promise<void> {
    return apiClient.delete(`/api/incidents/${id}`);
  }

  /**
   * List all incidents with optional filtering and pagination
   * GET /api/incidents?type={type}&severity={severity}&page={page}&limit={limit}
   *
   * @param filters - Optional filter parameters (type, severity, page, limit)
   * @returns Paginated list response with data array and total count
   * @throws APIError if validation fails (400) or server error (5xx)
   */
  static async listIncidents(filters?: ListIncidentsFilters): Promise<ListIncidentsResponse> {
    // Build query string from filters
    const params = new URLSearchParams();
    if (filters?.type) {
      params.append('type', filters.type);
    }
    if (filters?.severity) {
      params.append('severity', filters.severity);
    }
    if (filters?.page) {
      params.append('page', String(filters.page));
    }
    if (filters?.limit) {
      params.append('limit', String(filters.limit));
    }

    const queryString = params.toString();
    const url = `/api/incidents${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<ListIncidentsResponse>(url);
  }
}
