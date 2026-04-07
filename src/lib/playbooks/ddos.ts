import type { Playbook } from '../playbook-data'

export const DDOS_PLAYBOOK: Playbook = {
  incidentType: 'ddos',
  phases: [
    {
      id: 'erkennung',
      title: 'Phase 1: Erkennung',
      steps: [
        {
          id: 'erkennung-01',
          text: 'Ungewöhnliche Spitzenverkehrsmuster erkennen: Analyse von NetFlow/Sflow-Daten.',
          role: 'IT-Leiter',
        },
        {
          id: 'erkennung-02',
          text: 'Quelle des abnormalen Verkehrs identifizieren: Geografische Herkunft, ASN, Protokoll-Typen.',
          role: 'IT-Leiter',
        },
        {
          id: 'erkennung-03',
          text: 'Auswirkungen auf Geschäftsbetrieb prüfen: Sind Dienste erreichbar? Welche Benutzer sind betroffen?',
          role: 'CISO',
        },
        {
          id: 'erkennung-04',
          text: 'Baseline-Performance dokumentieren: RTO-Anforderungen ermitteln für diese Services.',
          role: 'IT-Leiter',
        },
        {
          id: 'erkennung-05',
          text: 'DDoS-Erkennungssystem prüfen: Sind IDS/IPS/WAF aktiv und funktionsfähig?',
          role: 'IT-Leiter',
        },
        {
          id: 'erkennung-06',
          text: 'Incident-Zeitstempel dokumentieren: Wann wurde der Anfall erkannt? Von wem?',
          role: 'CISO',
        },
        {
          id: 'erkennung-07',
          text: 'Erstes Lagebild erstellen: Betroffene Services, Datenmengen, Pakettypen, Angriffsvektor.',
          role: 'CISO',
        },
      ],
    },
    {
      id: 'mitigation',
      title: 'Phase 2: Mitigation',
      steps: [
        {
          id: 'mitigation-01',
          text: 'DDoS-Schutzservice aktivieren (z.B. Cloudflare, Akamai, AWS Shield Advanced).',
          role: 'IT-Leiter',
        },
        {
          id: 'mitigation-02',
          text: 'Firewall-Regeln verschärfen: Bekannte böswillige IP-Adressen blockieren, Rate Limiting aktivieren.',
          role: 'IT-Leiter',
        },
        {
          id: 'mitigation-03',
          text: 'Load Balancer konfigurieren: Traffic auf mehrere Backups verteilen, Connection-State prüfen.',
          role: 'IT-Leiter',
        },
        {
          id: 'mitigation-04',
          text: 'DNS-Service auf Redundanz prüfen: Sekundäre DNS-Server aktivieren, Zone-Transfers sichern.',
          role: 'IT-Leiter',
        },
        {
          id: 'mitigation-05',
          text: 'Bandbreitenlimits optimieren: QoS-Policies für kritische Dienste priorisieren.',
          role: 'IT-Leiter',
        },
        {
          id: 'mitigation-06',
          text: 'BGP-Flowspec einsetzen: Angriffsverkehr auf Netzwerk-Ebene filtern (falls vorhanden).',
          role: 'IT-Leiter',
          noGoWarning: 'BGP-Änderungen NICHT ohne Genehmigung durchführen! Falsche Konfiguration kann zu kompletten Netzwerkausfällen führen.',
        },
        {
          id: 'mitigation-07',
          text: 'Cache und CDN prüfen: Sind Inhalte gecacht? Kann Traffic über CDN geleitet werden?',
          role: 'IT-Leiter',
        },
      ],
    },
    {
      id: 'upstream',
      title: 'Phase 3: Upstream-Benachrichtigung',
      steps: [
        {
          id: 'upstream-01',
          text: 'ISP/Transit-Provider kontaktieren: DDoS-Anfall melden, technische Details übergeben.',
          role: 'IT-Leiter',
        },
        {
          id: 'upstream-02',
          text: 'Upstream-DDoS-Filter aktivieren: Provider kann Traffic vor Ihrer Organisation filtern.',
          role: 'IT-Leiter',
        },
        {
          id: 'upstream-03',
          text: 'Carrier-Kontakt und Eskalationskette dokumentieren: Wer ist erreichbar? Ticketnummer?',
          role: 'CISO',
        },
        {
          id: 'upstream-04',
          text: 'Monitoring des Angriffs kontinuierlich mit Provider koordinieren: Ist Mitigation erfolgreich?',
          role: 'IT-Leiter',
        },
      ],
    },
    {
      id: 'kommunikation',
      title: 'Phase 4: Kommunikation',
      steps: [
        {
          id: 'kommunikation-01',
          text: 'Geschäftsleitung und Verwaltungsrat informieren: Dauer des Ausfalls, Geschäftsauswirkungen.',
          role: 'CEO',
        },
        {
          id: 'kommunikation-02',
          text: 'Krisenstab einberufen: Koordination zwischen IT, Geschäftsleitung und externen Partnern.',
          role: 'CEO',
        },
        {
          id: 'kommunikation-03',
          text: 'Status-Page aktivieren: Kunden und Partner über Ausfallzeit und Wiederherstellung informieren.',
          role: 'CEO',
        },
        {
          id: 'kommunikation-04',
          text: 'Interne Kommunikation: Mitarbeitende über Ausfallursache und erwartete Dauer informieren.',
          role: 'CEO',
        },
        {
          id: 'kommunikation-05',
          text: 'Meldepflichten prüfen: ISG, FINMA (bei kritischer Infrastruktur).',
          role: 'CISO',
        },
        {
          id: 'kommunikation-06',
          text: 'RTO/RPO tracking: Dokumentieren Sie die Ausfallzeit und Wiederherstellungszeit.',
          role: 'CISO',
        },
        {
          id: 'kommunikation-07',
          text: 'Post-Incident Review planen: Was haben wir gelernt? Wie können wir uns besser schützen?',
          role: 'CISO',
        },
      ],
    },
  ],
}
