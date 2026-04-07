/**
 * Phishing Incident Playbook
 * 25-step playbook covering detection, containment, investigation, and communication
 */

import type { Playbook } from '@/types/playbook';

export const PHISHING_PLAYBOOK: Playbook = {
  type: 'phishing',
  title: 'Phishing Incident Playbook',
  description:
    'Response procedures for phishing attacks targeting employees or infrastructure. Covers email analysis, account security, user communication, and threat investigation.',
  estimatedDuration: '24-72 hours',
  sections: [],
  steps: [
    // ==================== DETECTION (7 steps) ====================
    {
      number: 1,
      section: 'detection',
      title: 'Identify Phishing Email',
      action:
        'User or security team identifies suspicious email with indicators: unusual sender, suspicious links/attachments, urgency language, spelling errors.',
      responsible: 'IT-Leiter',
      timeframe: 'Immediately',
    },
    {
      number: 2,
      section: 'detection',
      title: 'Preserve Email Metadata',
      action:
        'Forward email to security team (do not delete). Save full email headers including sender IP, routing information, and timestamps for forensic analysis.',
      responsible: 'IT-Leiter',
      timeframe: 'Immediately',
      dependencies: [1],
    },
    {
      number: 3,
      section: 'detection',
      title: 'Verify Sender Identity',
      action:
        'Check sender email address, domain, SPF/DKIM/DMARC status. Contact purported sender via known phone/email to verify legitimacy.',
      responsible: 'IT-Leiter',
      timeframe: 'Immediately',
      dependencies: [1],
    },
    {
      number: 4,
      section: 'detection',
      title: 'Analyze URLs and Attachments',
      action:
        'Use VirusTotal, URLhaus, or sandbox environment to scan URLs and attachments. Do NOT click links or open attachments in user environment.',
      responsible: 'Forensik',
      timeframe: 'Within 30 minutes',
      dependencies: [1],
    },
    {
      number: 5,
      section: 'detection',
      title: 'Check Threat Intelligence',
      action:
        'Query internal threat intelligence platforms, abuse databases, and public indicators (IOCs) to identify known phishing campaigns.',
      responsible: 'Forensik',
      timeframe: 'Within 1 hour',
      dependencies: [1, 4],
    },
    {
      number: 6,
      section: 'detection',
      title: 'Determine Email Reach',
      action:
        'Search email system logs to identify all recipients of the phishing email. Tally how many users received it and flag accounts for monitoring.',
      responsible: 'IT-Leiter',
      timeframe: 'Within 1 hour',
      dependencies: [1],
    },
    {
      number: 7,
      section: 'detection',
      title: 'Document Initial Findings',
      action:
        'Record email timestamp, sender, recipients, suspicious content, initial analysis results, and classified threat level (high/medium/low).',
      responsible: 'CISO',
      timeframe: 'Within 1 hour',
      dependencies: [1, 4, 5, 6],
    },

    // ==================== CONTAINMENT (7 steps) ====================
    {
      number: 8,
      section: 'containment',
      title: 'Block Phishing Email Domain',
      action:
        'Update mail gateway rules to block sender domain. Add sender email to company blocklist. Remove or quarantine email from all mailboxes if possible.',
      responsible: 'IT-Leiter',
      timeframe: 'Immediately',
      dependencies: [1],
    },
    {
      number: 9,
      section: 'containment',
      title: 'Disable Suspicious Accounts',
      action:
        'If any user account was compromised or credentials entered, immediately disable the account. Force password reset and enable multi-factor authentication (MFA).',
      responsible: 'IT-Leiter',
      timeframe: 'Immediately',
      dependencies: [6],
    },
    {
      number: 10,
      section: 'containment',
      title: 'Reset Credentials for Exposed Users',
      action:
        'Reset passwords for all users who clicked links or opened attachments. Revoke active sessions and tokens. Notify users of password reset and force re-authentication.',
      responsible: 'IT-Leiter',
      timeframe: 'Within 30 minutes',
      dependencies: [9],
    },
    {
      number: 11,
      section: 'containment',
      title: 'Enforce MFA Temporarily',
      action:
        'Mandate MFA for all compromised/high-risk accounts. If MFA already enabled, review recent MFA logs for unusual activity.',
      responsible: 'IT-Leiter',
      timeframe: 'Within 1 hour',
      dependencies: [9, 10],
    },
    {
      number: 12,
      section: 'containment',
      title: 'Monitor Affected User Accounts',
      action:
        'Enable enhanced logging and monitoring for affected users: login attempts, email forwarding rules, file access, privilege changes.',
      responsible: 'Forensik',
      timeframe: 'Within 1 hour',
      dependencies: [9],
    },
    {
      number: 13,
      section: 'containment',
      title: 'Block Malicious URLs/IPs',
      action:
        'Update firewall and proxy rules to block identified phishing URLs and command-and-control (C2) server IPs. Add to DNS blacklists if applicable.',
      responsible: 'IT-Leiter',
      timeframe: 'Within 1 hour',
      dependencies: [4],
    },
    {
      number: 14,
      section: 'containment',
      title: 'Isolate Infected Endpoints',
      action:
        'If any endpoint was infected (malware from attachment), isolate it from network. Prevent lateral movement. Preserve for forensic analysis.',
      responsible: 'IT-Leiter',
      timeframe: 'Immediately',
      dependencies: [4],
    },

    // ==================== INVESTIGATION (7 steps) ====================
    {
      number: 15,
      section: 'investigation',
      title: 'Collect Email Headers & Logs',
      action:
        'Extract full email headers, SMTP transaction logs, gateway logs (SPF/DKIM/DMARC results), and attachment metadata. Save for forensic analysis.',
      responsible: 'Forensik',
      timeframe: 'Within 2 hours',
      dependencies: [2],
    },
    {
      number: 16,
      section: 'investigation',
      title: 'Analyze User Behavior',
      action:
        'Review user access logs: login locations, login times, unusual IP addresses, device types. Check for lateral movement indicators (privilege escalation, unusual file access).',
      responsible: 'Forensik',
      timeframe: 'Within 4 hours',
      dependencies: [12],
    },
    {
      number: 17,
      section: 'investigation',
      title: 'Conduct Sandbox Analysis',
      action:
        'Detonate attachments in isolated sandbox environment. Document behavior: network connections, registry changes, file modifications, command execution.',
      responsible: 'Forensik',
      timeframe: 'Within 4 hours',
      dependencies: [4, 14],
    },
    {
      number: 18,
      section: 'investigation',
      title: 'Research Threat Actor',
      action:
        'Investigate sender domain registration, whois information, domain history. Cross-reference with known phishing groups. Check public threat intelligence feeds.',
      responsible: 'Forensik',
      timeframe: 'Within 8 hours',
      dependencies: [5],
    },
    {
      number: 19,
      section: 'investigation',
      title: 'Identify Campaign Scope',
      action:
        'Determine if this is targeted spear-phishing or part of mass campaign. Check similar emails to other departments/organizations. Assess targeting intent.',
      responsible: 'CISO',
      timeframe: 'Within 8 hours',
      dependencies: [7, 18],
    },
    {
      number: 20,
      section: 'investigation',
      title: 'Check for Data Exfiltration',
      action:
        'Monitor network egress: unusual outbound connections, large data transfers, DNS queries to suspicious domains. Check if credentials were used elsewhere.',
      responsible: 'Forensik',
      timeframe: 'Within 24 hours',
      dependencies: [12, 16],
    },
    {
      number: 21,
      section: 'investigation',
      title: 'Document Forensic Findings',
      action:
        'Compile complete incident report: timeline, affected systems/users, indicators of compromise (IOCs), attack vectors, threat assessment, and root cause analysis.',
      responsible: 'CISO',
      timeframe: 'Within 24 hours',
      dependencies: [15, 17, 19, 20],
    },

    // ==================== COMMUNICATION (4 steps) ====================
    {
      number: 22,
      section: 'communication',
      title: 'Notify Affected Users',
      action:
        'Send security alert to all who received phishing email. Advise them to report if clicked/opened. Provide guidance: check for phishing indicators, reset password, enable MFA.',
      responsible: 'CISO',
      timeframe: 'Within 1 hour',
      dependencies: [8, 10],
    },
    {
      number: 23,
      section: 'communication',
      title: 'Report to Leadership',
      action:
        'Notify CEO, CRO, and executive team: incident scope, remediation status, estimated impact, regulatory obligations. Provide briefing on threat assessment.',
      responsible: 'CEO',
      timeframe: 'Within 2 hours',
      dependencies: [7, 21],
    },
    {
      number: 24,
      section: 'communication',
      title: 'Regulatory & Law Enforcement Reporting',
      action:
        'If data breach or regulated industry (finance, healthcare): report to authorities (NCSC, FBI, national data protection authority) as required by law.',
      responsible: 'CEO',
      timeframe: 'Within 24-72 hours',
      dependencies: [20, 23],
    },
    {
      number: 25,
      section: 'communication',
      title: 'Post-Incident Security Training',
      action:
        'Conduct security awareness training for all employees. Focus on phishing recognition, password hygiene, MFA usage, reporting procedures. Document completion.',
      responsible: 'HR',
      timeframe: 'Within 1 week',
      dependencies: [22],
    },
  ],
};

// Organize steps into sections for display
PHISHING_PLAYBOOK.sections = [
  {
    name: 'detection',
    title: 'Detection & Analysis',
    color: 'bg-blue-50',
    steps: PHISHING_PLAYBOOK.steps.filter((s) => s.section === 'detection'),
  },
  {
    name: 'containment',
    title: 'Containment & Response',
    color: 'bg-orange-50',
    steps: PHISHING_PLAYBOOK.steps.filter((s) => s.section === 'containment'),
  },
  {
    name: 'investigation',
    title: 'Investigation & Analysis',
    color: 'bg-purple-50',
    steps: PHISHING_PLAYBOOK.steps.filter((s) => s.section === 'investigation'),
  },
  {
    name: 'communication',
    title: 'Communication & Recovery',
    color: 'bg-green-50',
    steps: PHISHING_PLAYBOOK.steps.filter((s) => s.section === 'communication'),
  },
];
