'use client'

import { useWizard } from '../WizardContext'
import { StepNavigator } from '../StepNavigator'
import { RANSOMWARE_PLAYBOOK } from '@/lib/playbook-data'

const ERKANNT_DURCH_LABELS: Record<string, string> = {
  'it-mitarbeiter': 'IT-Mitarbeiter',
  'nutzer': 'Nutzer',
  'externes-system': 'Externes System',
  'angreifer-kontakt': 'Angreifer-Kontakt',
  'sonstiges': 'Sonstiges',
}

export function Step6Dokumentation() {
  const { state, dispatch } = useWizard()

  const erfassen = state.erfassen
  const klassifikation = state.klassifikation
  const reaktion = state.reaktion
  const kommunikation = state.kommunikation

  const totalSteps = RANSOMWARE_PLAYBOOK.phases.reduce((sum, p) => sum + p.steps.length, 0)
  const completedCount = reaktion?.completedSteps?.length ?? 0

  const fmt = (val: string | null | undefined): string => val ?? '—'

  const handlePrev = () => dispatch({ type: 'PREV_STEP' })

  const getSeverityClasses = (severity: string | undefined) => {
    if (severity === 'KRITISCH') return 'bg-red-100 border border-red-300 text-red-800'
    if (severity === 'HOCH') return 'bg-amber-100 border border-amber-300 text-amber-800'
    if (severity === 'MITTEL') return 'bg-yellow-50 border border-yellow-200 text-yellow-800'
    return ''
  }

  const capitalize = (s: string | null | undefined): string => {
    if (!s) return '—'
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-navy">Incident-Zusammenfassung</h2>
        <p className="text-sm text-gray-500">Erstellt: {new Date().toLocaleDateString('de-CH')}</p>
      </div>

      {/* Severity banner */}
      {klassifikation && (
        <div className={`rounded-lg px-4 py-3 font-medium text-sm ${getSeverityClasses(klassifikation.severity)}`}>
          Schweregrad: {klassifikation.severity} — Incident-Typ: {capitalize(klassifikation.incidentType)}
        </div>
      )}

      {/* Section 1: Was ist passiert */}
      <div className="bg-lightgray rounded-lg p-4 space-y-3">
        <h3 className="text-base font-bold text-navy">Was ist passiert</h3>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 w-40 shrink-0">Erkennungszeitpunkt</span>
          <span className="text-navy">
            {erfassen?.erkennungszeitpunkt
              ? new Date(erfassen.erkennungszeitpunkt).toLocaleString('de-CH')
              : '—'}
          </span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 w-40 shrink-0">Erkannt durch</span>
          <span className="text-navy">
            {erfassen?.erkannt_durch
              ? (ERKANNT_DURCH_LABELS[erfassen.erkannt_durch] ?? erfassen.erkannt_durch)
              : '—'}
          </span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 w-40 shrink-0">Erste Auffälligkeiten</span>
          <span className="text-navy">{fmt(erfassen?.erste_auffaelligkeiten)}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 w-40 shrink-0">Lösegeld-Forderung</span>
          <span className="text-navy">
            {erfassen?.loesegeld_meldung ? 'Ja' : erfassen ? 'Nein' : '—'}
          </span>
        </div>
      </div>

      {/* Section 2: Betroffene Systeme */}
      <div className="bg-lightgray rounded-lg p-4 space-y-3">
        <h3 className="text-base font-bold text-navy">Betroffene Systeme</h3>
        <div className="text-sm">
          {erfassen?.betroffene_systeme?.length && erfassen.betroffene_systeme.length > 0 ? (
            <div className="flex flex-wrap gap-1 mt-1">
              {erfassen.betroffene_systeme.map((system) => (
                <span
                  key={system}
                  className="inline-block bg-navy/10 text-navy text-xs px-2 py-0.5 rounded-full mr-1 mb-1"
                >
                  {system}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-navy">—</span>
          )}
        </div>
      </div>

      {/* Section 3: Klassifikation */}
      <div className="bg-lightgray rounded-lg p-4 space-y-3">
        <h3 className="text-base font-bold text-navy">Klassifikation</h3>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 w-40 shrink-0">Schweregrad</span>
          <span className="text-navy">{fmt(klassifikation?.severity)}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 w-40 shrink-0">Incident-Typ</span>
          <span className="text-navy">{capitalize(klassifikation?.incidentType)}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 w-40 shrink-0">Kritische Systeme</span>
          <span className="text-navy">
            {klassifikation?.q1SystemeBetroffen === 'ja' ? 'Ja' : klassifikation ? 'Nein' : '—'}
          </span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 w-40 shrink-0">Personendaten betroffen</span>
          <span className="text-navy">
            {klassifikation?.q2PdBetroffen === 'ja' ? 'Ja' : klassifikation ? 'Nein' : '—'}
          </span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 w-40 shrink-0">Angreifer aktiv</span>
          <span className="text-navy">
            {klassifikation?.q3AngreiferAktiv === 'ja'
              ? 'Ja'
              : klassifikation?.q3AngreiferAktiv === 'nein'
              ? 'Nein'
              : klassifikation?.q3AngreiferAktiv === 'unbekannt'
              ? 'Unbekannt'
              : '—'}
          </span>
        </div>
      </div>

      {/* Section 4: Massnahmen-Fortschritt */}
      <div className="bg-lightgray rounded-lg p-4 space-y-3">
        <h3 className="text-base font-bold text-navy">Massnahmen-Fortschritt</h3>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 w-40 shrink-0">Checkliste Reaktion</span>
          <span className="text-navy">{completedCount} von {totalSteps} Massnahmen erledigt</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
          <div
            className="bg-navy h-2 rounded-full"
            style={{ width: `${Math.round((completedCount / totalSteps) * 100)}%` }}
          />
        </div>
        <div className="text-sm">
          {completedCount < totalSteps ? (
            <span className="text-amber-800">
              {totalSteps - completedCount} Massnahmen ausstehend
            </span>
          ) : (
            <span className="text-navy">Alle Massnahmen abgeschlossen</span>
          )}
        </div>
      </div>

      {/* Section 5: Meldepflichten */}
      <div className="bg-lightgray rounded-lg p-4 space-y-3">
        <h3 className="text-base font-bold text-navy">Meldepflichten</h3>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 w-40 shrink-0">ISG/NCSC (24h)</span>
          <span className="text-navy">
            {kommunikation?.kritischeInfrastruktur === 'ja'
              ? 'Ja — 24h Frist'
              : kommunikation?.kritischeInfrastruktur === 'nein'
              ? 'Nein'
              : '—'}
          </span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 w-40 shrink-0">DSG/DSGVO</span>
          <span className="text-navy">
            {kommunikation?.personendatenBetroffen === 'ja'
              ? 'Ja'
              : kommunikation?.personendatenBetroffen === 'nein'
              ? 'Nein'
              : '—'}
          </span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 w-40 shrink-0">FINMA (24h/72h)</span>
          <span className="text-navy">
            {kommunikation?.reguliertesUnternehmen === 'ja'
              ? 'Ja'
              : kommunikation?.reguliertesUnternehmen === 'nein'
              ? 'Nein'
              : '—'}
          </span>
        </div>
      </div>

      {/* Section 6: Kommunikation */}
      <div className="bg-lightgray rounded-lg p-4 space-y-3">
        <h3 className="text-base font-bold text-navy">Kommunikation</h3>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 w-40 shrink-0">Kommunikations-Checkliste</span>
          <span className="text-navy">
            {kommunikation?.kommChecklist?.length && kommunikation.kommChecklist.length > 0
              ? kommunikation.kommChecklist.join(', ')
              : '—'}
          </span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 w-40 shrink-0">GL-Vorlage</span>
          <span className="text-navy">{kommunikation?.templateGL ? 'Erstellt' : '—'}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 w-40 shrink-0">Mitarbeitende-Vorlage</span>
          <span className="text-navy">{kommunikation?.templateMitarbeitende ? 'Erstellt' : '—'}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 w-40 shrink-0">Medien-Vorlage</span>
          <span className="text-navy">{kommunikation?.templateMedien ? 'Erstellt' : '—'}</span>
        </div>
      </div>

      {/* Nächste Schritte */}
      <div className="bg-lightgray rounded-lg p-4 space-y-2">
        <h3 className="text-base font-bold text-navy">Nächste Schritte</h3>
        <ul className="space-y-2 text-sm text-navy list-disc list-inside">
          <li>Bericht an SIAG-Berater übergeben (siehe unten)</li>
          <li>Offene Meldepflichten fristgerecht einhalten</li>
          <li>Ausstehende Reaktionsmassnahmen abschliessen</li>
          <li>Post-Incident-Review innerhalb von 72 Stunden durchführen</li>
          <li>Lessons Learned dokumentieren und Prozesse anpassen</li>
        </ul>
      </div>

      {/* SIAG Handoff CTA */}
      <div className="bg-navy text-white rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-bold">An SIAG-Berater übergeben</h3>
        <p className="text-sm text-white/80">
          Ihr SIAG-Berater übernimmt ab hier die Koordination. Teilen Sie diesen Bericht oder kontaktieren Sie uns direkt.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="tel:+41XXXXXXXXX"
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-3 rounded-lg text-sm font-medium min-h-[44px]"
          >
            +41 XX XXX XX XX
          </a>
          <a
            href="mailto:incident@siag.ch"
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-3 rounded-lg text-sm font-medium min-h-[44px]"
          >
            incident@siag.ch
          </a>
        </div>
        <p className="text-xs text-white/60">
          Bereitschaft: 24/7 — Antwortzeit: &lt; 1 Stunde bei kritischen Vorfällen
        </p>
      </div>

      {/* Navigation — final step, no forward button */}
      <StepNavigator
        currentStep={state.currentStep}
        onNext={() => {}}
        onPrev={handlePrev}
        showNext={false}
      />
    </div>
  )
}
