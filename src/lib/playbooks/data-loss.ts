import type { Playbook } from '../playbook-data'

export const DATA_LOSS_PLAYBOOK: Playbook = {
  incidentType: 'datenverlust',
  phases: [
    {
      id: 'erkennung',
      title: 'Phase 1: Erkennung',
      steps: [
        {
          id: 'erkennung-01',
          text: 'Ungewöhnlicher Datenzugriff oder Exfiltration erkennen: Logging und Monitoring-Alerts prüfen.',
          role: 'IT-Leiter',
        },
        {
          id: 'erkennung-02',
          text: 'Betroffene Datensätze identifizieren: Welche Informationen wurden möglicherweise exfiltriert?',
          role: 'Forensik',
        },
        {
          id: 'erkennung-03',
          text: 'Umfang des Vorfalls bewerten: Wie viele Datensätze? Welche Zeitspanne?',
          role: 'CISO',
        },
        {
          id: 'erkennung-04',
          text: 'Datenklassifizierung überprüfen: Sind sensible oder personenbezogene Daten betroffen?',
          role: 'CISO',
        },
        {
          id: 'erkennung-05',
          text: 'Exfiltrationsmechanismus prüfen: Wie wurden die Daten übertragen? Über welche Kanäle?',
          role: 'Forensik',
        },
        {
          id: 'erkennung-06',
          text: 'Incident-Zeitstempel dokumentieren: Wann wurde der Vorfall entdeckt? Von wem?',
          role: 'CISO',
        },
        {
          id: 'erkennung-07',
          text: 'Erstes Lagebild erstellen: Betroffene Systeme, Art der Daten, Zeithorizont der Exfiltration.',
          role: 'CISO',
        },
      ],
    },
    {
      id: 'eindaemmung',
      title: 'Phase 2: Eindämmung',
      steps: [
        {
          id: 'eindaemmung-01',
          text: 'Alle betroffenen Benutzerkonten sofort sperren: Verhindere weitere Datenzugriffe durch Angreifer.',
          role: 'IT-Leiter',
        },
        {
          id: 'eindaemmung-02',
          text: 'Betroffene Systeme isolieren: Netzwerk-Zugang trennen, falls möglich.',
          role: 'IT-Leiter',
          noGoWarning: 'Systeme NICHT herunterfahren! Isolieren Sie stattdessen nur die Netzwerkverbindung für forensische Beweise.',
        },
        {
          id: 'eindaemmung-03',
          text: 'Administratorkonten zurücksetzen: Prüfen Sie, ob Angreifer privilegierte Zugänge hatten.',
          role: 'IT-Leiter',
        },
        {
          id: 'eindaemmung-04',
          text: 'Zugriffskontrollisten (ACLs) überprüfen und zurücksetzen: Entfernen Sie verdächtige Einträge.',
          role: 'IT-Leiter',
        },
        {
          id: 'eindaemmung-05',
          text: 'Authentifizierungsmechanismen verstärken: MFA aktivieren, SSH-Keys rotieren, Passwords zurücksetzen.',
          role: 'IT-Leiter',
        },
        {
          id: 'eindaemmung-06',
          text: 'VPN und Remote-Zugang überprüfen: Deaktivieren oder sichern Sie Remote-Sessions.',
          role: 'IT-Leiter',
        },
        {
          id: 'eindaemmung-07',
          text: 'Monitoring und Alerting verstärken: Aktivieren Sie verstärkte Überwachung verdächtiger Aktivitäten.',
          role: 'IT-Leiter',
        },
      ],
    },
    {
      id: 'untersuchung',
      title: 'Phase 3: Untersuchung',
      steps: [
        {
          id: 'untersuchung-01',
          text: 'Forensische Sicherung durchführen: RAM-Dumps, Festplatten-Images, Log-Dateien archivieren.',
          role: 'Forensik',
          noGoWarning: 'Originalmedien NICHT ändern! Verwenden Sie Read-Only Kopien für die Analyse.',
        },
        {
          id: 'untersuchung-02',
          text: 'Eindringsgvektor identifizieren: Wie sind die Angreifer ins System gelangt? Phishing? Schwache Passwörter?',
          role: 'Forensik',
        },
        {
          id: 'untersuchung-03',
          text: 'Log-Dateien analysieren: Lesen Sie Web-Server-Logs, Datenbank-Audit-Logs, Betriebssystem-Logs.',
          role: 'Forensik',
        },
        {
          id: 'untersuchung-04',
          text: 'Ransom-Notiz oder Erpressungsschreiben analysieren: Enthält es Hinweise auf die Bedrohungsakteursgruppe?',
          role: 'CISO',
        },
        {
          id: 'untersuchung-05',
          text: 'Bedrohungsakteur identifizieren: Gibt es Hinweise auf eine bekannte Gang oder Nation-State?',
          role: 'Forensik',
        },
        {
          id: 'untersuchung-06',
          text: 'Zeitleiste der Exfiltration rekonstruieren: Wann hat der Zugriff begonnen? Wie lange waren Daten sichtbar?',
          role: 'Forensik',
        },
        {
          id: 'untersuchung-07',
          text: 'Dateneigentümer benachrichtigen: Wer besitzt die betroffenen Daten? Was müssen sie wissen?',
          role: 'CISO',
        },
      ],
    },
    {
      id: 'kommunikation',
      title: 'Phase 4: Kommunikation',
      steps: [
        {
          id: 'kommunikation-01',
          text: 'Geschäftsleitung und Verwaltungsrat informieren: Datenumfang, Sensitivität, Geschäftsauswirkungen.',
          role: 'CEO',
        },
        {
          id: 'kommunikation-02',
          text: 'Krisenstab einberufen: Koordination zwischen IT, Forensik, Rechtsabteilung und PR.',
          role: 'CEO',
        },
        {
          id: 'kommunikation-03',
          text: 'Datenschutzbehörden benachrichtigen: ISG, EDOEB, DSGVO-Behörden bei EU-Daten.',
          role: 'CISO',
        },
        {
          id: 'kommunikation-04',
          text: 'Betroffene Personen informieren: Brief- oder Email-Kampagne starten, Haftpflicht-Versicherung prüfen.',
          role: 'CEO',
        },
      ],
    },
  ],
}
