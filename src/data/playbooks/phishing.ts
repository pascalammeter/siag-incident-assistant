/**
 * Phishing Incident Playbook
 * 25-step playbook covering detection, containment, investigation, and communication
 * Uses legacy Playbook format (with phases) for compatibility with Step4Reaktion component
 */

// Import legacy types from playbook-data
interface PlaybookStep {
  id: string;
  text: string;
  role: 'IT-Leiter' | 'CISO' | 'CEO' | 'Forensik' | 'HR' | 'Legal';
  noGoWarning?: string;
}

interface PlaybookPhase {
  id: string;
  title: string;
  steps: PlaybookStep[];
}

export interface Playbook {
  incidentType: string;
  phases: PlaybookPhase[];
}

export const PHISHING_PLAYBOOK: Playbook = {
  incidentType: 'phishing',
  phases: [
    {
      id: 'detection',
      title: 'Phase 1: Detection & Analysis',
      steps: [
        {
          id: 'detection-01',
          text: 'Identify suspicious email: unusual sender, suspicious links/attachments, urgency language, spelling errors.',
          role: 'IT-Leiter',
        },
        {
          id: 'detection-02',
          text: 'Preserve email metadata: save full headers, sender IP, routing info, timestamps for forensic analysis.',
          role: 'IT-Leiter',
        },
        {
          id: 'detection-03',
          text: 'Verify sender identity: check email address, domain, SPF/DKIM/DMARC. Contact purported sender via known channels.',
          role: 'IT-Leiter',
        },
        {
          id: 'detection-04',
          text: 'Analyze URLs/attachments: use VirusTotal, URLhaus, or sandbox. Do NOT click or open in user environment.',
          role: 'Forensik',
        },
        {
          id: 'detection-05',
          text: 'Check threat intelligence: query IOC databases and threat feeds to identify known campaigns.',
          role: 'Forensik',
        },
        {
          id: 'detection-06',
          text: 'Determine email reach: search logs to find all recipients. Flag accounts for monitoring.',
          role: 'IT-Leiter',
        },
        {
          id: 'detection-07',
          text: 'Document findings: record timestamp, sender, recipients, analysis results, and threat level.',
          role: 'CISO',
        },
      ],
    },
    {
      id: 'containment',
      title: 'Phase 2: Containment & Response',
      steps: [
        {
          id: 'containment-01',
          text: 'Block sender domain: update mail gateway rules, add to blocklist, quarantine from all mailboxes.',
          role: 'IT-Leiter',
        },
        {
          id: 'containment-02',
          text: 'Disable compromised accounts: immediately disable accounts where credentials were entered. Reset passwords.',
          role: 'IT-Leiter',
        },
        {
          id: 'containment-03',
          text: 'Reset credentials: force password reset for all exposed users. Revoke active sessions and tokens.',
          role: 'IT-Leiter',
        },
        {
          id: 'containment-04',
          text: 'Enforce MFA: mandate MFA for compromised accounts. Review existing MFA logs for unusual activity.',
          role: 'IT-Leiter',
        },
        {
          id: 'containment-05',
          text: 'Monitor accounts: enable enhanced logging for affected users (login, email rules, file access, privileges).',
          role: 'Forensik',
        },
        {
          id: 'containment-06',
          text: 'Block malicious URLs/IPs: update firewall and proxy rules. Add to DNS blacklists.',
          role: 'IT-Leiter',
        },
        {
          id: 'containment-07',
          text: 'Isolate infected endpoints: remove from network if malware detected. Preserve for forensic analysis.',
          role: 'IT-Leiter',
        },
      ],
    },
    {
      id: 'investigation',
      title: 'Phase 3: Investigation & Analysis',
      steps: [
        {
          id: 'investigation-01',
          text: 'Collect email headers/logs: extract SMTP logs, gateway logs (SPF/DKIM/DMARC), attachment metadata.',
          role: 'Forensik',
        },
        {
          id: 'investigation-02',
          text: 'Analyze user behavior: review access logs for unusual locations, times, IPs, devices, privilege changes.',
          role: 'Forensik',
        },
        {
          id: 'investigation-03',
          text: 'Conduct sandbox analysis: detonate attachments. Document behavior: network, registry, file changes.',
          role: 'Forensik',
        },
        {
          id: 'investigation-04',
          text: 'Research threat actor: investigate domain registration, whois, history. Cross-reference with known groups.',
          role: 'Forensik',
        },
        {
          id: 'investigation-05',
          text: 'Identify campaign scope: determine if targeted spear-phishing or mass campaign. Assess intent.',
          role: 'CISO',
        },
        {
          id: 'investigation-06',
          text: 'Check data exfiltration: monitor network egress for unusual connections, DNS queries, data transfers.',
          role: 'Forensik',
        },
        {
          id: 'investigation-07',
          text: 'Document findings: compile report with timeline, affected systems/users, IOCs, vectors, and root cause.',
          role: 'CISO',
        },
      ],
    },
    {
      id: 'communication',
      title: 'Phase 4: Communication & Recovery',
      steps: [
        {
          id: 'communication-01',
          text: 'Notify users: send alert to all recipients. Advise on phishing indicators, password reset, MFA enablement.',
          role: 'CISO',
        },
        {
          id: 'communication-02',
          text: 'Notify leadership: brief CEO, CRO, executives on scope, remediation status, impact, regulatory obligations.',
          role: 'CEO',
        },
        {
          id: 'communication-03',
          text: 'Report to authorities: if data breach or regulated industry, report to authorities (NCSC, FBI, DPA) as required.',
          role: 'CEO',
        },
        {
          id: 'communication-04',
          text: 'Conduct security training: train all employees on phishing recognition, password hygiene, MFA, reporting.',
          role: 'HR',
        },
      ],
    },
  ],
};
