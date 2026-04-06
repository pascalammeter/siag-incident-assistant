export type IncidentType = 'ransomware' | 'phishing' | 'ddos' | 'data_loss' | 'other';
export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface APIError {
  error: string;
  details?: Array<{ field: string; message: string }>;
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
}
