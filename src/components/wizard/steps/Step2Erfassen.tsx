'use client'

import { useWizard } from '../WizardContext'
import { StepForm } from '../StepForm'
import { erfassenSchema } from '@/lib/wizard-schemas'
import type { ErfassenFormData } from '@/lib/wizard-schemas'
import type { KlassifikationData } from '@/lib/wizard-types'

const ERKANNT_DURCH_OPTIONS = [
  { value: 'it-mitarbeiter', label: 'IT-Mitarbeiter' },
  { value: 'nutzer', label: 'Nutzer/Mitarbeitende' },
  { value: 'externes-system', label: 'Externes System/Monitoring' },
  { value: 'angreifer-kontakt', label: 'Angreifer-Kontakt' },
  { value: 'sonstiges', label: 'Sonstiges' },
] as const

const SYSTEME_OPTIONS = [
  { value: 'workstations', label: 'Workstations' },
  { value: 'server', label: 'Server' },
  { value: 'backups', label: 'Backups' },
  { value: 'email', label: 'E-Mail' },
  { value: 'netzwerk', label: 'Netzwerk' },
  { value: 'ot-ics', label: 'OT/ICS' },
  { value: 'sonstiges', label: 'Sonstiges' },
] as const

const inputClass =
  'w-full border border-gray-300 rounded-lg px-4 py-3 text-base bg-white focus:ring-2 focus:ring-navy focus:border-navy outline-none min-h-[44px]'

const selectClass =
  'w-full border border-gray-300 rounded-lg px-4 py-3 text-base bg-white focus:ring-2 focus:ring-navy focus:border-navy outline-none min-h-[44px] appearance-none'

const labelClass = 'text-sm font-normal text-navy mb-1 block'

export function Step2Erfassen() {
  const { state } = useWizard()
  const incidentType = (state.klassifikation as Partial<KlassifikationData>)?.incidentType

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy">Vorfall erfassen</h2>
      <p className="text-base text-gray-600 leading-relaxed">
        Erfassen Sie die wichtigsten Informationen zum Vorfall. Diese Daten bilden die Grundlage fuer alle weiteren Schritte.
      </p>
      {incidentType && (
        <div className="bg-navy/10 border border-navy/20 rounded-lg px-4 py-2 text-sm text-navy font-medium">
          Vorfall-Typ: <span className="font-bold capitalize">{incidentType}</span>
        </div>
      )}
      <StepForm<ErfassenFormData> stepKey="erfassen" schema={erfassenSchema}>
        {(form) => (
          <div className="space-y-6">
            {/* Meldefrist Banner */}
            <div className="border-l-4 border-amber bg-amber/10 rounded-r-lg p-4 flex items-center gap-3">
              <span className="text-xl">&#9888;</span>
              <p className="text-sm font-normal text-navy">
                Achtung: Mit der Erkennung eines Vorfalls beginnen rechtliche Meldefristen zu laufen.
              </p>
            </div>

            {/* Field 1: Erkennungszeitpunkt */}
            <div className="space-y-1">
              <label className={labelClass}>
                Wann wurde der Vorfall erkannt? <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-2 items-end">
                <input
                  {...form.register('erkennungszeitpunkt')}
                  type="datetime-local"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-base bg-white focus:ring-2 focus:ring-navy focus:border-navy outline-none min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date()
                    const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                      .toISOString()
                      .slice(0, 16)
                    form.setValue('erkennungszeitpunkt', localISO, { shouldValidate: true })
                  }}
                  className="bg-lightgray border border-navy text-navy px-4 py-2 rounded-lg text-sm font-bold min-h-[44px] whitespace-nowrap"
                >
                  Jetzt eintragen
                </button>
              </div>
              {form.formState.errors.erkennungszeitpunkt && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.erkennungszeitpunkt.message as string}
                </p>
              )}
            </div>

            {/* Field 2: Erkannt durch */}
            <div className="space-y-1">
              <label className={labelClass}>
                Durch wen wurde der Vorfall erkannt? <span className="text-red-600">*</span>
              </label>
              <select
                {...form.register('erkannt_durch')}
                defaultValue=""
                className={selectClass}
              >
                <option value="" disabled>Bitte waehlen...</option>
                {ERKANNT_DURCH_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {form.formState.errors.erkannt_durch && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.erkannt_durch.message as string}
                </p>
              )}
            </div>

            {/* Field 3: Betroffene Systeme */}
            <div className="space-y-1">
              <label className={labelClass}>
                Betroffene Systeme/Assets
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SYSTEME_OPTIONS.map((system) => (
                  <label key={system.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={system.value}
                      {...form.register('betroffene_systeme')}
                      className="w-5 h-5 rounded border-gray-300 accent-navy"
                    />
                    <span className="text-sm text-navy">{system.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Field 4: Erste Auffaelligkeiten */}
            <div className="space-y-1">
              <label className={labelClass}>
                Erste Auffaelligkeiten / Beschreibung
              </label>
              <textarea
                {...form.register('erste_auffaelligkeiten')}
                placeholder="Was ist Ihnen aufgefallen? Z.B. verschluesselte Dateien, ungewoehnliche Netzwerkaktivitaet..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base bg-white focus:ring-2 focus:ring-navy focus:border-navy outline-none min-h-[120px] resize-y"
              />
            </div>

            {/* Ransomware-specific: Loesegeld-Meldung */}
            {(!incidentType || incidentType === 'ransomware') && (
              <div className="border-l-4 border-amber bg-amber/10 rounded-r-lg p-4 flex items-start gap-3">
                <input
                  type="checkbox"
                  {...form.register('loesegeld_meldung')}
                  className="w-5 h-5 rounded border-gray-300 accent-navy mt-0.5"
                />
                <span className="text-sm font-normal text-navy">
                  Ist ein Loesegeld-Schreiben oder eine Verschluesselungs-Meldung vorhanden?
                </span>
              </div>
            )}

            {/* Phishing-specific fields */}
            {incidentType === 'phishing' && (
              <div className="space-y-4 border-l-4 border-navy/30 pl-4">
                <p className="text-sm font-bold text-navy">Phishing-spezifische Angaben</p>
                <div className="space-y-1">
                  <label className={labelClass}>Verdächtige E-Mail-Adresse</label>
                  <input
                    {...form.register('phishing_email_adresse')}
                    type="email"
                    placeholder="z.B. angreifer@fake-domain.com"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Verdächtige URL / Link</label>
                  <input
                    {...form.register('phishing_url')}
                    type="text"
                    placeholder="z.B. https://fake-login.example.com"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Anzahl betroffene Nutzer</label>
                  <input
                    {...form.register('phishing_nutzer_anzahl')}
                    type="number"
                    min="0"
                    placeholder="z.B. 5"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Wurden Credentials eingegeben?</label>
                  <select {...form.register('phishing_credentials_eingegeben')} defaultValue="" className={selectClass}>
                    <option value="" disabled>Bitte waehlen...</option>
                    <option value="ja">Ja</option>
                    <option value="nein">Nein</option>
                  </select>
                </div>
              </div>
            )}

            {/* DDoS-specific fields */}
            {incidentType === 'ddos' && (
              <div className="space-y-4 border-l-4 border-navy/30 pl-4">
                <p className="text-sm font-bold text-navy">DDoS-spezifische Angaben</p>
                <div className="space-y-1">
                  <label className={labelClass}>Betroffene Dienste</label>
                  <input
                    {...form.register('ddos_betroffene_dienste')}
                    type="text"
                    placeholder="z.B. Website, E-Mail-Server, VPN"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Beginn des Angriffs</label>
                  <input
                    {...form.register('ddos_beginn')}
                    type="datetime-local"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Geschätzte Bandbreite / Intensität</label>
                  <input
                    {...form.register('ddos_bandbreite')}
                    type="text"
                    placeholder="z.B. 10 Gbps, Dienst komplett ausgefallen"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {/* Datenverlust-specific fields */}
            {incidentType === 'datenverlust' && (
              <div className="space-y-4 border-l-4 border-navy/30 pl-4">
                <p className="text-sm font-bold text-navy">Datenverlust-spezifische Angaben</p>
                <div className="space-y-1">
                  <label className={labelClass}>Art der betroffenen Daten</label>
                  <input
                    {...form.register('datenverlust_art_daten')}
                    type="text"
                    placeholder="z.B. Kundendaten, Personendaten, Finanzdaten"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Anzahl betroffene Datensätze (geschätzt)</label>
                  <input
                    {...form.register('datenverlust_anzahl_datensaetze')}
                    type="number"
                    min="0"
                    placeholder="z.B. 1000"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Wurden Daten extern übermittelt?</label>
                  <select {...form.register('datenverlust_extern_uebermittelt')} defaultValue="" className={selectClass}>
                    <option value="" disabled>Bitte waehlen...</option>
                    <option value="ja">Ja</option>
                    <option value="nein">Nein</option>
                  </select>
                </div>
              </div>
            )}

            {/* Unbefugter Zugriff-specific fields */}
            {incidentType === 'unbefugter-zugriff' && (
              <div className="space-y-4 border-l-4 border-navy/30 pl-4">
                <p className="text-sm font-bold text-navy">Angaben zum unbefugten Zugriff</p>
                <div className="space-y-1">
                  <label className={labelClass}>Angriffsvektor</label>
                  <select {...form.register('zugriff_angriffsvektor')} defaultValue="" className={selectClass}>
                    <option value="" disabled>Bitte waehlen...</option>
                    <option value="brute-force">Brute Force</option>
                    <option value="gestohlene-credentials">Gestohlene Credentials</option>
                    <option value="insider">Insider</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Betroffene Accounts / Systeme</label>
                  <input
                    {...form.register('zugriff_betroffene_accounts')}
                    type="text"
                    placeholder="z.B. admin@firma.ch, VPN-Zugang, Domain Controller"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {/* Sonstiges-specific fields */}
            {incidentType === 'sonstiges' && (
              <div className="space-y-4 border-l-4 border-navy/30 pl-4">
                <p className="text-sm font-bold text-navy">Weitere Angaben</p>
                <div className="space-y-1">
                  <label className={labelClass}>Art des Vorfalls</label>
                  <textarea
                    {...form.register('sonstiges_beschreibung')}
                    placeholder="Beschreiben Sie die Art des Vorfalls..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base bg-white focus:ring-2 focus:ring-navy focus:border-navy outline-none min-h-[120px] resize-y"
                  />
                </div>
              </div>
            )}

            {/* Timestamp Display (conditional) */}
            {form.watch('erkennungszeitpunkt') && (
              <div className="bg-navy text-white rounded-lg p-4 text-center">
                <p className="text-sm font-normal opacity-80">Erkennungszeitpunkt</p>
                <p className="text-2xl font-bold">
                  {new Date(form.watch('erkennungszeitpunkt')).toLocaleString('de-CH', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-sm opacity-80 mt-1">Ihre rechtliche Meldefrist beginnt jetzt.</p>
              </div>
            )}
          </div>
        )}
      </StepForm>
    </div>
  )
}
