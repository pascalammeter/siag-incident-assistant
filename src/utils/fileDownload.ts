import { Response } from 'express';

export interface FileDownloadOptions {
  filename: string;
  mimeType: string;
}

export function setDownloadHeaders(
  res: Response,
  options: FileDownloadOptions
): void {
  res.setHeader('Content-Type', options.mimeType);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(options.filename)}"`
  );
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

export function generateFileName(incidentId: string, format: 'json' | 'pdf'): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const extension = format === 'json' ? 'json' : 'pdf';
  return `incident-${incidentId}-${timestamp}.${extension}`;
}
