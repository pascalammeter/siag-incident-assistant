import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
import { setDownloadHeaders, generateFileName } from '../../src/utils/fileDownload';

describe('fileDownload Utilities', () => {
  describe('setDownloadHeaders', () => {
    let mockRes: any;

    beforeEach(() => {
      mockRes = {
        setHeader: vi.fn(),
      };
    });

    it('should set Content-Type header', () => {
      const options = {
        filename: 'incident-123.json',
        mimeType: 'application/json',
      };

      setDownloadHeaders(mockRes, options);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    });

    it('should set Content-Disposition header with encoded filename', () => {
      const options = {
        filename: 'incident-123.json',
        mimeType: 'application/json',
      };

      setDownloadHeaders(mockRes, options);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment; filename=')
      );
    });

    it('should URL-encode special characters in filename', () => {
      const options = {
        filename: 'incident-123-test (1).json',
        mimeType: 'application/json',
      };

      setDownloadHeaders(mockRes, options);

      const call = mockRes.setHeader.mock.calls.find(
        (c: any) => c[0] === 'Content-Disposition'
      );
      expect(call[1]).toContain('attachment; filename=');
      // The filename should be URL-encoded
      expect(call[1]).toContain('%20'); // space
    });

    it('should set Cache-Control header to disable caching', () => {
      const options = {
        filename: 'incident-123.pdf',
        mimeType: 'application/pdf',
      };

      setDownloadHeaders(mockRes, options);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'no-cache, no-store, must-revalidate'
      );
    });

    it('should set Pragma header', () => {
      const options = {
        filename: 'incident-123.pdf',
        mimeType: 'application/pdf',
      };

      setDownloadHeaders(mockRes, options);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Pragma', 'no-cache');
    });

    it('should set Expires header to 0', () => {
      const options = {
        filename: 'incident-123.pdf',
        mimeType: 'application/pdf',
      };

      setDownloadHeaders(mockRes, options);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Expires', '0');
    });

    it('should set all required headers for JSON download', () => {
      const options = {
        filename: 'test-incident.json',
        mimeType: 'application/json',
      };

      setDownloadHeaders(mockRes, options);

      expect(mockRes.setHeader).toHaveBeenCalledTimes(5);
      const headerNames = mockRes.setHeader.mock.calls.map((call: any) => call[0]);
      expect(headerNames).toContain('Content-Type');
      expect(headerNames).toContain('Content-Disposition');
      expect(headerNames).toContain('Cache-Control');
      expect(headerNames).toContain('Pragma');
      expect(headerNames).toContain('Expires');
    });

    it('should set all required headers for PDF download', () => {
      const options = {
        filename: 'test-incident.pdf',
        mimeType: 'application/pdf',
      };

      setDownloadHeaders(mockRes, options);

      expect(mockRes.setHeader).toHaveBeenCalledTimes(5);
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    });

    it('should handle filenames with dots correctly', () => {
      const options = {
        filename: 'incident-2026.04.07.json',
        mimeType: 'application/json',
      };

      setDownloadHeaders(mockRes, options);

      const call = mockRes.setHeader.mock.calls.find(
        (c: any) => c[0] === 'Content-Disposition'
      );
      expect(call[1]).toContain('incident-2026');
    });

    it('should handle empty filename', () => {
      const options = {
        filename: '',
        mimeType: 'application/json',
      };

      setDownloadHeaders(mockRes, options);

      expect(mockRes.setHeader).toHaveBeenCalled();
      const call = mockRes.setHeader.mock.calls.find(
        (c: any) => c[0] === 'Content-Disposition'
      );
      expect(call[1]).toContain('attachment; filename=');
    });
  });

  describe('generateFileName', () => {
    it('should generate JSON filename with correct format', () => {
      const incidentId = '123e4567-e89b-12d3-a456-426614174000';
      const filename = generateFileName(incidentId, 'json');

      expect(filename).toMatch(/^incident-123e4567-e89b-12d3-a456-426614174000-\d{4}-\d{2}-\d{2}\.json$/);
    });

    it('should generate PDF filename with correct format', () => {
      const incidentId = '987f6543-b210-54d3-c789-987654321fff';
      const filename = generateFileName(incidentId, 'pdf');

      expect(filename).toMatch(/^incident-987f6543-b210-54d3-c789-987654321fff-\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should include today\'s date in ISO format (YYYY-MM-DD)', () => {
      const incidentId = 'test-id';
      const filename = generateFileName(incidentId, 'json');

      const today = new Date().toISOString().split('T')[0];
      expect(filename).toContain(today);
    });

    it('should use correct file extension for JSON', () => {
      const incidentId = 'abc123';
      const filename = generateFileName(incidentId, 'json');

      expect(filename).toMatch(/\.json$/);
    });

    it('should use correct file extension for PDF', () => {
      const incidentId = 'abc123';
      const filename = generateFileName(incidentId, 'pdf');

      expect(filename).toMatch(/\.pdf$/);
    });

    it('should include incident ID in filename', () => {
      const incidentId = 'my-unique-incident-id';
      const filename = generateFileName(incidentId, 'json');

      expect(filename).toContain(incidentId);
    });

    it('should start with "incident-"', () => {
      const incidentId = 'any-id';
      const filename = generateFileName(incidentId, 'json');

      expect(filename).toMatch(/^incident-/);
    });

    it('should generate unique filenames for different incidents', () => {
      const filename1 = generateFileName('id1', 'json');
      const filename2 = generateFileName('id2', 'json');

      expect(filename1).not.toBe(filename2);
    });

    it('should generate same filename format for same incident on same day', () => {
      const incidentId = 'same-id';
      const filename1 = generateFileName(incidentId, 'json');
      const filename2 = generateFileName(incidentId, 'json');

      expect(filename1).toBe(filename2);
    });

    it('should handle UUID format incident IDs', () => {
      const uuidId = '550e8400-e29b-41d4-a716-446655440000';
      const filename = generateFileName(uuidId, 'pdf');

      expect(filename).toContain(uuidId);
      expect(filename).toMatch(/\.pdf$/);
    });

    it('should handle short incident IDs', () => {
      const shortId = 'a';
      const filename = generateFileName(shortId, 'json');

      expect(filename).toContain(shortId);
    });
  });

  describe('Integration: setDownloadHeaders + generateFileName', () => {
    let mockRes: any;

    beforeEach(() => {
      mockRes = {
        setHeader: vi.fn(),
      };
    });

    it('should work together for JSON export', () => {
      const incidentId = '123e4567-e89b-12d3-a456-426614174000';
      const filename = generateFileName(incidentId, 'json');

      setDownloadHeaders(mockRes, {
        filename,
        mimeType: 'application/json',
      });

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      const contentDispositionCall = mockRes.setHeader.mock.calls.find(
        (c: any) => c[0] === 'Content-Disposition'
      );
      expect(contentDispositionCall[1]).toContain('incident-123e4567-e89b-12d3-a456-426614174000');
    });

    it('should work together for PDF export', () => {
      const incidentId = '456f7890-e29b-41d4-a716-446655440000';
      const filename = generateFileName(incidentId, 'pdf');

      setDownloadHeaders(mockRes, {
        filename,
        mimeType: 'application/pdf',
      });

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      const contentDispositionCall = mockRes.setHeader.mock.calls.find(
        (c: any) => c[0] === 'Content-Disposition'
      );
      expect(contentDispositionCall[1]).toContain('incident-456f7890-e29b-41d4-a716-446655440000');
    });
  });
});
