/**
 * Phishing Incident Playbook
 * 25-Schritte-Playbook für Erkennung, Eindämmung, Untersuchung und Kommunikation
 * Kompatibel mit Step4Reaktion-Komponente (Playbook-Format mit Phasen)
 */

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
      id: 'erkennung',
      title: 'Phase 1: Erkennung & Analyse',
      steps: [
        {
          id: 'detection-01',
          text: 'Verdächtige E-Mail identifizieren: ungewöhnlicher Absender, verdächtige Links/Anhänge, Dringlichkeitssprache, Rechtschreibfehler.',
          role: 'IT-Leiter',
        },
        {
          id: 'detection-02',
          text: 'E-Mail-Metadaten sichern: vollständige Header, Absender-IP, Routing-Informationen und Zeitstempel für forensische Analyse aufbewahren.',
          role: 'IT-Leiter',
        },
        {
          id: 'detection-03',
          text: 'Absender-Identität prüfen: E-Mail-Adresse, Domain, SPF/DKIM/DMARC kontrollieren. Vermeintlichen Absender über bekannte Kanäle kontaktieren.',
          role: 'IT-Leiter',
        },
        {
          id: 'detection-04',
          text: 'URLs/Anhänge analysieren: VirusTotal, URLhaus oder Sandbox verwenden. NICHT in der Benutzerumgebung öffnen oder anklicken.',
          role: 'Forensik',
          noGoWarning: 'Links und Anhänge NICHT direkt öffnen! Analyse ausschliesslich in isolierter Sandbox-Umgebung durchführen.',
        },
        {
          id: 'detection-05',
          text: 'Bedrohungsintelligenz prüfen: IOC-Datenbanken und Threat-Feeds abfragen, um bekannte Kampagnen zu identifizieren.',
          role: 'Forensik',
        },
        {
          id: 'detection-06',
          text: 'E-Mail-Reichweite bestimmen: Logs durchsuchen, um alle Empfänger zu finden. Betroffene Konten für Überwachung markieren.',
          role: 'IT-Leiter',
        },
        {
          id: 'detection-07',
          text: 'Befunde dokumentieren: Zeitstempel, Absender, Empfänger, Analyseergebnisse und Bedrohungsstufe festhalten.',
          role: 'CISO',
        },
      ],
    },
    {
      id: 'eindaemmung',
      title: 'Phase 2: Eindämmung & Reaktion',
      steps: [
        {
          id: 'containment-01',
          text: 'Absender-Domain blockieren: Mail-Gateway-Regeln aktualisieren, zur Sperrliste hinzufügen, aus allen Postfächern in Quarantäne verschieben.',
          role: 'IT-Leiter',
        },
        {
          id: 'containment-02',
          text: 'Kompromittierte Konten deaktivieren: Konten, bei denen Zugangsdaten eingegeben wurden, sofort deaktivieren. Passwörter zurücksetzen.',
          role: 'IT-Leiter',
        },
        {
          id: 'containment-03',
          text: 'Zugangsdaten zurücksetzen: Passwort-Reset für alle betroffenen Benutzer erzwingen. Aktive Sitzungen und Tokens widerrufen.',
          role: 'IT-Leiter',
        },
        {
          id: 'containment-04',
          text: 'MFA durchsetzen: Für kompromittierte Konten MFA vorschreiben. Vorhandene MFA-Logs auf ungewöhnliche Aktivitäten prüfen.',
          role: 'IT-Leiter',
        },
        {
          id: 'containment-05',
          text: 'Konten überwachen: Erweitertes Logging für betroffene Benutzer aktivieren (Anmeldung, E-Mail-Regeln, Dateizugriff, Berechtigungen).',
          role: 'Forensik',
        },
        {
          id: 'containment-06',
          text: 'Schädliche URLs/IPs blockieren: Firewall- und Proxy-Regeln aktualisieren. Zu DNS-Sperrlisten hinzufügen.',
          role: 'IT-Leiter',
        },
        {
          id: 'containment-07',
          text: 'Infizierte Endgeräte isolieren: Bei Malware-Fund vom Netzwerk trennen. Für forensische Analyse aufbewahren.',
          role: 'IT-Leiter',
          noGoWarning: 'Infizierte Geräte NICHT bereinigen, bevor forensische Sicherung abgeschlossen ist! Beweise werden sonst vernichtet.',
        },
      ],
    },
    {
      id: 'untersuchung',
      title: 'Phase 3: Untersuchung & Analyse',
      steps: [
        {
          id: 'investigation-01',
          text: 'E-Mail-Header/Logs sammeln: SMTP-Logs, Gateway-Logs (SPF/DKIM/DMARC), Anhang-Metadaten extrahieren.',
          role: 'Forensik',
        },
        {
          id: 'investigation-02',
          text: 'Benutzerverhalten analysieren: Zugriffsprotokolle auf ungewöhnliche Orte, Zeiten, IPs, Geräte und Rechteänderungen prüfen.',
          role: 'Forensik',
        },
        {
          id: 'investigation-03',
          text: 'Sandbox-Analyse durchführen: Anhänge detonieren. Verhalten dokumentieren: Netzwerk, Registry, Dateiänderungen.',
          role: 'Forensik',
        },
        {
          id: 'investigation-04',
          text: 'Bedrohungsakteur recherchieren: Domain-Registrierung, Whois, Verlauf untersuchen. Mit bekannten Gruppen abgleichen.',
          role: 'Forensik',
        },
        {
          id: 'investigation-05',
          text: 'Kampagnen-Umfang bestimmen: Handelt es sich um gezieltes Spear-Phishing oder eine Massenkampagne? Absicht einschätzen.',
          role: 'CISO',
        },
        {
          id: 'investigation-06',
          text: 'Datenexfiltration prüfen: Netzwerk-Ausgangsverkehr auf ungewöhnliche Verbindungen, DNS-Abfragen und Datentransfers überwachen.',
          role: 'Forensik',
        },
        {
          id: 'investigation-07',
          text: 'Befunde dokumentieren: Bericht mit Timeline, betroffenen Systemen/Benutzern, IOCs, Angriffsvektor und Grundursache erstellen.',
          role: 'CISO',
        },
      ],
    },
    {
      id: 'kommunikation',
      title: 'Phase 4: Kommunikation & Wiederherstellung',
      steps: [
        {
          id: 'communication-01',
          text: 'Benutzer benachrichtigen: Warnung an alle Empfänger senden. Hinweise zu Phishing-Merkmalen, Passwort-Reset und MFA-Aktivierung geben.',
          role: 'CISO',
        },
        {
          id: 'communication-02',
          text: 'Geschäftsleitung informieren: CEO, CISO und Führungskräfte über Umfang, Behebungsstatus, Auswirkungen und regulatorische Pflichten briefen.',
          role: 'CEO',
        },
        {
          id: 'communication-03',
          text: 'Behörden melden: Bei Datenpanne oder reguliertem Unternehmen Meldung an NCSC/BACS, EDOEB (DSG) und FINMA prüfen.',
          role: 'CEO',
        },
        {
          id: 'communication-04',
          text: 'Sicherheitsschulung durchführen: Alle Mitarbeitenden zu Phishing-Erkennung, Passwort-Hygiene, MFA und Meldewegen schulen.',
          role: 'HR',
        },
      ],
    },
  ],
};
