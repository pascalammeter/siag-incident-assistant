export interface PlaybookStep {
  id: string
  text: string
  role: 'IT-Leiter' | 'CISO' | 'CEO' | 'Forensik' | 'Legal' | 'HR'
  noGoWarning?: string
}

export interface PlaybookPhase {
  id: string
  title: string
  steps: PlaybookStep[]
}

export interface Playbook {
  incidentType: string
  phases: PlaybookPhase[]
}

export const RANSOMWARE_PLAYBOOK: Playbook = {
  incidentType: 'ransomware',
  phases: [
    {
      id: 'sofort',
      title: 'Phase 1: Sofortmassnahmen',
      steps: [
        {
          id: 'sofort-01',
          text: 'Betroffene Systeme sofort vom Netzwerk trennen (LAN-Kabel ziehen, WLAN deaktivieren).',
          role: 'IT-Leiter',
        },
        {
          id: 'sofort-02',
          text: 'Systeme NICHT herunterfahren oder neu starten — Beweise im RAM gehen verloren.',
          role: 'IT-Leiter',
          noGoWarning: 'Systeme NICHT neu starten! Fluechtiger Speicher (RAM) enthaelt forensische Beweise, die beim Neustart unwiederbringlich verloren gehen.',
        },
        {
          id: 'sofort-03',
          text: 'Backup-Systeme sofort isolieren — pruefen, ob Backups noch intakt sind.',
          role: 'IT-Leiter',
          noGoWarning: 'Backups NICHT mit dem Netzwerk verbunden lassen! Ransomware verschluesselt haeufig auch erreichbare Backups.',
        },
        {
          id: 'sofort-04',
          text: 'Screenshot der Loesegeldforderung sichern (Foto mit Handy genuegt).',
          role: 'IT-Leiter',
        },
        {
          id: 'sofort-05',
          text: 'KEIN Loesegeld zahlen und NICHT mit den Angreifern kommunizieren.',
          role: 'CISO',
          noGoWarning: 'KEIN Loesegeld zahlen! Zahlung garantiert keine Entschluesselung und finanziert weitere Angriffe. Zudem kann eine Zahlung rechtliche Konsequenzen haben.',
        },
        {
          id: 'sofort-06',
          text: 'Incident-Zeitstempel dokumentieren: Wann wurde der Vorfall bemerkt? Von wem?',
          role: 'CISO',
        },
        {
          id: 'sofort-07',
          text: 'Erstes Lagebild erstellen: Welche Systeme sind betroffen? Welche Daten sind gefaehrdet?',
          role: 'CISO',
        },
      ],
    },
    {
      id: 'eindaemmung',
      title: 'Phase 2: Eindaemmung',
      steps: [
        {
          id: 'eindaemmung-01',
          text: 'Alle Administratorkonten und privilegierten Zugaenge sofort zuruecksetzen.',
          role: 'IT-Leiter',
        },
        {
          id: 'eindaemmung-02',
          text: 'VPN-Zugaenge und Remote-Desktop-Verbindungen deaktivieren.',
          role: 'IT-Leiter',
        },
        {
          id: 'eindaemmung-03',
          text: 'Netzwerksegmentierung pruefen und nicht betroffene Segmente schuetzen.',
          role: 'IT-Leiter',
        },
        {
          id: 'eindaemmung-04',
          text: 'E-Mail-System isolieren, falls kompromittiert (Phishing als Angriffsvektor pruefen).',
          role: 'IT-Leiter',
        },
        {
          id: 'eindaemmung-05',
          text: 'Firewall-Regeln verschaerfen: ausgehenden Datenverkehr auf bekannte C2-Server blockieren.',
          role: 'Forensik',
        },
        {
          id: 'eindaemmung-06',
          text: 'Monitoring verstaerken: Logdaten sichern und Echtzeit-Ueberwachung aktivieren.',
          role: 'Forensik',
        },
      ],
    },
    {
      id: 'untersuchung',
      title: 'Phase 3: Untersuchung',
      steps: [
        {
          id: 'untersuchung-01',
          text: 'Forensische Sicherung der betroffenen Systeme (Festplatten-Images, RAM-Dumps).',
          role: 'Forensik',
          noGoWarning: 'Systeme NICHT bereinigen, bevor forensische Sicherung abgeschlossen ist! Beweise werden sonst vernichtet.',
        },
        {
          id: 'untersuchung-02',
          text: 'Angriffsvektor identifizieren: Wie sind die Angreifer ins System gelangt?',
          role: 'Forensik',
        },
        {
          id: 'untersuchung-03',
          text: 'Ausmass des Schadens ermitteln: Welche Daten wurden verschluesselt oder exfiltriert?',
          role: 'Forensik',
        },
        {
          id: 'untersuchung-04',
          text: 'Ransomware-Variante identifizieren (z.B. via ID Ransomware oder CERT-Datenbanken).',
          role: 'Forensik',
        },
        {
          id: 'untersuchung-05',
          text: 'Pruefen, ob Entschluesselungstools verfuegbar sind (nomoreransom.org).',
          role: 'CISO',
        },
        {
          id: 'untersuchung-06',
          text: 'Zeitliche Rekonstruktion des Angriffs (Timeline) erstellen.',
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
          text: 'Geschaeftsleitung und Verwaltungsrat informieren (Lage, Ausmass, naechste Schritte).',
          role: 'CEO',
        },
        {
          id: 'kommunikation-02',
          text: 'Krisenstab einberufen und Kommunikationsverantwortliche(n) benennen.',
          role: 'CEO',
        },
        {
          id: 'kommunikation-03',
          text: 'Meldepflichten pruefen: NCSC/BACS (ISG), EDOEB (DSG/DSGVO), FINMA falls zutreffend.',
          role: 'CISO',
        },
        {
          id: 'kommunikation-04',
          text: 'Strafanzeige bei der zustaendigen Kantonspolizei oder beim NCSC erstatten.',
          role: 'CISO',
        },
        {
          id: 'kommunikation-05',
          text: 'Mitarbeitende intern informieren: Was ist passiert, was sollen sie tun/lassen.',
          role: 'CEO',
        },
        {
          id: 'kommunikation-06',
          text: 'Bei Bedarf externe Kommunikation vorbereiten (Kunden, Partner, Medien).',
          role: 'CEO',
        },
      ],
    },
  ],
}

import { DDOS_PLAYBOOK } from './playbooks/ddos'
import { DATA_LOSS_PLAYBOOK } from './playbooks/data-loss'
import { PHISHING_PLAYBOOK as IMPORTED_PHISHING_PLAYBOOK } from '../data/playbooks/phishing'

export const PLAYBOOKS: Record<string, Playbook> = {
  ransomware: RANSOMWARE_PLAYBOOK,
  ddos: DDOS_PLAYBOOK,
  datenverlust: DATA_LOSS_PLAYBOOK,
}

export { DDOS_PLAYBOOK } from './playbooks/ddos'
export { DATA_LOSS_PLAYBOOK } from './playbooks/data-loss'

export const getPlaybook = (type: string): Playbook => {
  switch (type) {
    case 'ransomware':
      return RANSOMWARE_PLAYBOOK
    case 'phishing':
      return IMPORTED_PHISHING_PLAYBOOK
    case 'ddos':
      return DDOS_PLAYBOOK
    case 'datenverlust':
      return DATA_LOSS_PLAYBOOK
    default:
      return RANSOMWARE_PLAYBOOK
  }
}
