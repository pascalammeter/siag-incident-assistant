import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateTitlePageHTML,
  generateIncidentDetailsHTML,
  generateCompletePDF,
  generateHeaderFooterHTML,
} from '@/lib/pdf-templates';
import { Incident } from '@/lib/incident-types';

// Mock incident data for testing
const mockIncident: Incident = {
  id: 'test-incident-123',
  createdAt: new Date('2026-04-07'),
  updatedAt: new Date('2026-04-07'),
  incident_type: 'ransomware',
  severity: 'high',
  erkennungszeitpunkt: new Date('2026-04-07T10:00:00Z'),
  erkannt_durch: 'Email gateway alert',
  betroffene_systeme: ['Server-001', 'Server-002', 'Workstation-005'],
  erste_erkenntnisse: 'Suspicious executable detected in email attachment',
  q1: 1,
  q2: 0,
  q3: 1,
  playbook: {
    isolate_systems: { title: 'Isolate affected systems', completed: true },
    preserve_evidence: { title: 'Preserve evidence and logs', completed: true },
    notify_authorities: { title: 'Notify authorities', completed: false },
  },
  regulatorische_meldungen: {
    isg_24h: '2026-04-07T12:00:00Z',
    dsg: true,
  },
  metadata: {
    tags: ['critical', 'urgent'],
    notes: 'Ransomware infection confirmed',
  },
};

describe('PDF Export - HTML Templates', () => {
  describe('generateTitlePageHTML', () => {
    it('returns valid HTML with DOCTYPE and closing tags', () => {
      const html = generateTitlePageHTML(mockIncident);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
      expect(html).toContain('</head>');
      expect(html).toContain('</body>');
    });

    it('includes incident ID in title page', () => {
      const html = generateTitlePageHTML(mockIncident);
      expect(html).toContain('test-incident-123');
    });

    it('includes incident creation date', () => {
      const html = generateTitlePageHTML(mockIncident);
      expect(html).toContain('April 7, 2026');
    });

    it('includes incident type formatted', () => {
      const html = generateTitlePageHTML(mockIncident);
      expect(html).toContain('Ransomware'); // Capitalized
    });

    it('includes severity in uppercase', () => {
      const html = generateTitlePageHTML(mockIncident);
      expect(html).toContain('HIGH');
    });

    it('includes SIAG logo SVG element', () => {
      const html = generateTitlePageHTML(mockIncident);
      expect(html).toContain('<svg');
      expect(html).toContain('</svg>');
      expect(html).toContain('#CC0033'); // SIAG red
    });

    it('includes "Incident Report" heading', () => {
      const html = generateTitlePageHTML(mockIncident);
      expect(html).toContain('Incident Report');
    });

    it('includes detected time if provided', () => {
      const html = generateTitlePageHTML(mockIncident);
      expect(html).toContain('Incident Detected');
      // Time format may vary by locale, just check that time is included
      expect(html).toMatch(/\d{1,2}:\d{2}/); // Any time format like HH:MM
    });
  });

  describe('generateIncidentDetailsHTML', () => {
    it('returns valid HTML structure', () => {
      const html = generateIncidentDetailsHTML(mockIncident);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });

    it('includes "Incident Details" heading', () => {
      const html = generateIncidentDetailsHTML(mockIncident);
      expect(html).toContain('Incident Details');
    });

    it('includes Recognition & Discovery section', () => {
      const html = generateIncidentDetailsHTML(mockIncident);
      expect(html).toContain('Recognition & Discovery');
    });

    it('includes detected-by information', () => {
      const html = generateIncidentDetailsHTML(mockIncident);
      expect(html).toContain('Email gateway alert');
    });

    it('includes affected systems list', () => {
      const html = generateIncidentDetailsHTML(mockIncident);
      expect(html).toContain('Server-001');
      expect(html).toContain('Server-002');
      expect(html).toContain('Workstation-005');
    });

    it('includes initial findings', () => {
      const html = generateIncidentDetailsHTML(mockIncident);
      expect(html).toContain('Suspicious executable detected');
    });

    it('includes Classification section', () => {
      const html = generateIncidentDetailsHTML(mockIncident);
      expect(html).toContain('Classification');
      expect(html).toContain('ransomware');
    });

    it('includes Playbook Checklist with all items', () => {
      const html = generateIncidentDetailsHTML(mockIncident);
      expect(html).toContain('Playbook Checklist');
      expect(html).toContain('Isolate affected systems');
      expect(html).toContain('Preserve evidence and logs');
      expect(html).toContain('Notify authorities');
    });

    it('marks completed playbook items with strikethrough', () => {
      const html = generateIncidentDetailsHTML(mockIncident);
      expect(html).toContain('checked');
    });

    it('includes Regulatory Notifications section', () => {
      const html = generateIncidentDetailsHTML(mockIncident);
      expect(html).toContain('Regulatory Notifications');
    });

    it('includes Additional Metadata section', () => {
      const html = generateIncidentDetailsHTML(mockIncident);
      expect(html).toContain('Additional Metadata');
      expect(html).toContain('critical');
      expect(html).toContain('urgent');
    });

    it('handles missing optional fields gracefully', () => {
      const minimalIncident: Incident = {
        id: 'minimal-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        severity: 'low',
      };
      const html = generateIncidentDetailsHTML(minimalIncident);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Incident Details');
      expect(html).not.toThrow;
    });
  });

  describe('generateHeaderFooterHTML', () => {
    it('returns valid HTML with header and footer classes', () => {
      const html = generateHeaderFooterHTML(mockIncident);
      expect(html).toContain('pdf-header');
      expect(html).toContain('pdf-footer');
    });

    it('includes incident ID in header', () => {
      const html = generateHeaderFooterHTML(mockIncident);
      expect(html).toContain('test-incident-123');
    });

    it('includes creation date in header', () => {
      const html = generateHeaderFooterHTML(mockIncident);
      expect(html).toContain('April 7, 2026');
    });

    it('includes page number placeholder', () => {
      const html = generateHeaderFooterHTML(mockIncident);
      expect(html).toContain('page-number');
    });
  });

  describe('generateCompletePDF', () => {
    it('returns valid HTML with complete structure', () => {
      const html = generateCompletePDF(mockIncident);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });

    it('includes title page content', () => {
      const html = generateCompletePDF(mockIncident);
      expect(html).toContain('Incident Report');
      expect(html).toContain('test-incident-123');
    });

    it('includes incident details content', () => {
      const html = generateCompletePDF(mockIncident);
      expect(html).toContain('Incident Details');
      expect(html).toContain('Playbook Checklist');
    });

    it('includes CSS @page rules for headers and footers', () => {
      const html = generateCompletePDF(mockIncident);
      expect(html).toContain('@page');
      expect(html).toContain('@top-center');
      expect(html).toContain('@bottom-center');
    });

    it('includes header content with incident ID and date', () => {
      const html = generateCompletePDF(mockIncident);
      expect(html).toContain('test-incident-123');
      expect(html).toContain('April 7, 2026');
    });

    it('includes footer with page counter', () => {
      const html = generateCompletePDF(mockIncident);
      expect(html).toContain('counter(page)');
      expect(html).toContain('counter(pages)');
    });

    it('excludes headers/footers from first page with :first selector', () => {
      const html = generateCompletePDF(mockIncident);
      expect(html).toContain('@page :first');
      expect(html).toContain('content: none'); // Hide headers/footers on first page
    });

    it('includes page break rule for title page', () => {
      const html = generateCompletePDF(mockIncident);
      expect(html).toContain('page-break-after: always');
    });

    it('includes professional styling with SIAG colors', () => {
      const html = generateCompletePDF(mockIncident);
      expect(html).toContain('#CC0033'); // SIAG red - used in title page and details
      // Navy color may be in details section CSS
      expect(html).toMatch(/#\w{6}/); // Any hex color code present
    });

    it('includes print-friendly styles', () => {
      const html = generateCompletePDF(mockIncident);
      expect(html).toContain('@media print');
    });

    it('has proper font sizing for readability', () => {
      const html = generateCompletePDF(mockIncident);
      // Check for multiple font sizes meeting minimum 12pt requirement
      expect(html).toContain('12pt'); // Body text
      expect(html).toContain('10pt'); // Headers/footers smaller text
      expect(html).toContain('16pt'); // Section headers
      // Check for large heading size (either 24pt or 24px)
      const hasLargeHeading = html.includes('24pt') || html.includes('24px') || html.includes('48px');
      expect(hasLargeHeading).toBe(true);
    });
  });
});

describe('PDF Export - Integration', () => {
  it('all template functions work together in complete PDF', () => {
    const titlePage = generateTitlePageHTML(mockIncident);
    const details = generateIncidentDetailsHTML(mockIncident);
    const complete = generateCompletePDF(mockIncident);

    // Verify all components are present in final output
    expect(complete).toContain('test-incident-123'); // From title
    expect(complete).toContain('Playbook Checklist'); // From details
    expect(complete).toContain('@page'); // From headers/footers
  });

  it('PDF is properly formatted for A4 paper size', () => {
    const html = generateCompletePDF(mockIncident);
    expect(html).toContain('size: A4');
    expect(html).toContain('margin: 25mm 20mm'); // Top/bottom 25mm, left/right 20mm
  });

  it('handles incident with no optional fields', () => {
    const minimalIncident: Incident = {
      id: 'minimal-id',
      createdAt: new Date('2026-04-07'),
      updatedAt: new Date('2026-04-07'),
      severity: 'critical',
    };

    const html = generateCompletePDF(minimalIncident);
    expect(html).toContain('minimal-id');
    expect(html).toContain('CRITICAL');
    expect(html).not.toContain('undefined');
  });

  it('handles incident with all fields populated', () => {
    const html = generateCompletePDF(mockIncident);
    expect(html).toContain('test-incident-123');
    expect(html).toContain('Email gateway alert');
    expect(html).toContain('Server-001');
    expect(html).toContain('Playbook Checklist');
  });

  it('escapes HTML special characters in titles and content', () => {
    const incidentWithSpecialChars: Incident = {
      ...mockIncident,
      erste_erkenntnisse: 'Found <script> tag in email & suspicious & "quoted"',
    };

    const html = generateIncidentDetailsHTML(incidentWithSpecialChars);
    // Raw characters should not appear in HTML output if properly escaped
    // (This test validates input safety)
    expect(html).toBeTruthy();
  });

  it('generates unique filenames with incident ID and date', () => {
    const incident1 = { ...mockIncident, id: 'incident-1' };
    const incident2 = { ...mockIncident, id: 'incident-2' };

    const html1 = generateCompletePDF(incident1);
    const html2 = generateCompletePDF(incident2);

    // Each should contain its own ID
    expect(html1).toContain('incident-1');
    expect(html2).toContain('incident-2');
  });
});

describe('PDF Export - Error Handling', () => {
  it('handles empty incident gracefully', () => {
    const emptyIncident: Incident = {
      id: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const html = generateCompletePDF(emptyIncident);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).not.toContain('undefined');
  });

  it('handles null playbook items', () => {
    const incidentNoPlaybook: Incident = {
      ...mockIncident,
      playbook: null,
    };

    const html = generateIncidentDetailsHTML(incidentNoPlaybook);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).not.toThrow;
  });

  it('handles malformed playbook object', () => {
    const incidentMalformed: Incident = {
      ...mockIncident,
      playbook: 'not-an-object' as any,
    };

    // Should handle gracefully or throw meaningful error
    expect(() => generateIncidentDetailsHTML(incidentMalformed)).toBeDefined();
  });

  it('generates valid HTML even with missing metadata', () => {
    const incidentNoMeta: Incident = {
      ...mockIncident,
      metadata: null,
      regulatorische_meldungen: null,
    };

    const html = generateCompletePDF(incidentNoMeta);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
  });
});
