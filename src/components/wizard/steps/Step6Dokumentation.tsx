'use client'

import { useMemo, useState } from 'react'
import { useWizard } from '../WizardContext'
import { StepNavigator } from '../StepNavigator'
import { getPlaybook } from '@/lib/playbook-data'
import type { KlassifikationData } from '@/lib/wizard-types'
import { useIncident } from '@/hooks/useIncident'
import { mapIncidentState } from '@/lib/migration'
import type { LegacyWizardState } from '@/lib/migration'
import { showSuccessToast, showErrorToast } from '@/components/Toast'

const ERKANNT_DURCH_LABELS: Record<string, string> = {
  'it-mitarbeiter': 'IT-Mitarbeiter',
  'nutzer': 'Nutzer',
  'externes-system': 'Externes System',
  'angreifer-kontakt': 'Angreifer-Kontakt',
  'sonstiges': 'Sonstiges',
}

export function Step6Dokumentation() {
  const { state, dispatch } = useWizard()
  const { createIncident, isLoading: isSaving } = useIncident()
  const [saveSuccess, setSaveSuccess] = useState(false)

  const erfassen = state.erfassen
  const klassifikation = state.klassifikation
  const reaktion = state.reaktion
  const kommunikation = state.kommunikation

  const incidentType = (klassifikation as Partial<KlassifikationData>)?.incidentType
  const playbook = useMemo(() => getPlaybook(incidentType ?? 'ransomware'), [incidentType])
  const totalSteps = useMemo(
    () => playbook.phases.reduce((sum, p) => sum + p.steps.length, 0),
    [playbook]
  )
  const completedCount = reaktion?.completedSteps?.length ?? 0
  const progressPercent = totalSteps > 0
    ? Math.round((completedCount / totalSteps) * 100)
    : 0

  const fmt = (val: string | null | undefined): string => val ?? '—'

  const handlePrev = () => dispatch({ type: 'PREV_STEP' })
  const handleReset = () => dispatch({ type: 'RESET' })

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const handleSave = async () => {
    // Map wizard state to API input using existing migration mapper
    const input = mapIncidentState(state as unknown as LegacyWizardState)
    if (!input) {
      showErrorToast('Incident-Daten unvollstaendig. Bitte pruefen Sie Typ und Schweregrad.')
      return
    }

    try {
      await createIncident(input)
      setSaveSuccess(true)
      showSuccessToast('Incident erfolgreich gespeichert!')
      // Brief delay so user sees the success toast, then reset
      setTimeout(() => {
        dispatch({ type: 'RESET' })
      }, 1500)
    } catch {
      showErrorToast('Fehler beim Speichern. Bitte versuchen Sie es erneut.', {
        label: 'Wiederholen',
        onClick: () => void handleSave(),
      })
    }
  }

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
      {/* Print-only header — hidden in browser, shown in print */}
      <div className="print-only hidden space-y-1 border-b border-gray-300 pb-4 mb-2">
        <p className="text-xl font-bold text-navy">SIAG Incident Management Assistent</p>
        <p className="text-base font-semibold text-navy">Incident-Zusammenfassung</p>
        <p className="text-sm text-gray-500">Erstellt: {new Date().toLocaleDateString('de-CH')}</p>
      </div>

      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-navy dark:text-white">Incident-Zusammenfassung</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">Erstellt: {new Date().toLocaleDateString('de-CH')}</p>
      </div>

      {/* Export button — top placement */}
      <div className="flex justify-end print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="bg-white border border-navy text-navy px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] hover:bg-lightgray transition-colors flex items-center gap-2"
        >
          Bericht exportieren (PDF)
        </button>
      </div>

      {/* Severity banner */}
      {klassifikation && (
        <div className={`rounded-lg px-4 py-3 font-medium text-sm ${getSeverityClasses(klassifikation.severity)}`}>
          Schweregrad: {klassifikation.severity} — Incident-Typ: {capitalize(klassifikation.incidentType)}
        </div>
      )}

      {/* Save & Complete — placed here so it's immediately visible */}
      <div className="flex flex-col items-center gap-3 print:hidden">
        {!saveSuccess && (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-navy text-white px-6 py-3 rounded-full text-sm font-bold min-h-[44px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Wird gespeichert...
              </>
            ) : (
              'Speichern & Abschliessen'
            )}
          </button>
        )}
        {saveSuccess && (
          <p className="text-green-700 dark:text-green-400 text-sm font-medium">
            Incident gespeichert
          </p>
        )}
        <button
          type="button"
          onClick={handleReset}
          className="text-siag-red hover:underline text-sm font-medium min-h-[44px]"
        >
          Neuen Incident erfassen
        </button>
      </div>

      {/* Section 1: Was ist passiert */}
      <div className="bg-lightgray dark:bg-slate-800 rounded-lg p-4 space-y-3 print-section">
        <h3 className="text-base font-bold text-navy dark:text-white">Was ist passiert</h3>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 dark:text-slate-400 w-40 shrink-0">Erkennungszeitpunkt</span>
          <span className="text-navy dark:text-slate-200">
            {erfassen?.erkennungszeitpunkt
              ? new Date(erfassen.erkennungszeitpunkt).toLocaleString('de-CH')
              : '—'}
          </span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 dark:text-slate-400 w-40 shrink-0">Erkannt durch</span>
          <span className="text-navy dark:text-slate-200">
            {erfassen?.erkannt_durch
              ? (ERKANNT_DURCH_LABELS[erfassen.erkannt_durch] ?? erfassen.erkannt_durch)
              : '—'}
          </span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 dark:text-slate-400 w-40 shrink-0">Erste Auffälligkeiten</span>
          <span className="text-navy dark:text-slate-200">{fmt(erfassen?.erste_auffaelligkeiten)}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 dark:text-slate-400 w-40 shrink-0">Lösegeld-Forderung</span>
          <span className="text-navy dark:text-slate-200">
            {erfassen?.loesegeld_meldung === true
              ? 'Ja'
              : erfassen?.loesegeld_meldung === false
              ? 'Nein'
              : '—'}
          </span>
        </div>
      </div>

      {/* Section 2: Betroffene Systeme */}
      <div className="bg-lightgray dark:bg-slate-800 rounded-lg p-4 space-y-3 print-section">
        <h3 className="text-base font-bold text-navy dark:text-white">Betroffene Systeme</h3>
        <div className="text-sm">
          {erfassen?.betroffene_systeme?.length && erfassen.betroffene_systeme.length > 0 ? (
            <div className="flex flex-wrap gap-1 mt-1">
              {erfassen.betroffene_systeme.map((system) => (
                <span
                  key={system}
                  className="inline-block bg-navy/10 dark:bg-white/10 text-navy dark:text-slate-200 text-xs px-2 py-0.5 rounded-full mr-1 mb-1"
                >
                  {system}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-navy dark:text-slate-200">—</span>
          )}
        </div>
      </div>

      {/* Section 3: Klassifikation */}
      <div className="bg-lightgray dark:bg-slate-800 rounded-lg p-4 space-y-3 print-section">
        <h3 className="text-base font-bold text-navy dark:text-white">Klassifikation</h3>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 dark:text-slate-400 w-40 shrink-0">Schweregrad</span>
          <span className="text-navy dark:text-slate-200">{fmt(klassifikation?.severity)}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 dark:text-slate-400 w-40 shrink-0">Incident-Typ</span>
          <span className="text-navy dark:text-slate-200">{capitalize(klassifikation?.incidentType)}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 dark:text-slate-400 w-40 shrink-0">Kritische Systeme</span>
          <span className="text-navy dark:text-slate-200">
            {klassifikation?.q1SystemeBetroffen === 'ja'
              ? 'Ja'
              : klassifikation?.q1SystemeBetroffen === 'nein'
              ? 'Nein'
              : '—'}
          </span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 dark:text-slate-400 w-40 shrink-0">Personendaten betroffen</span>
          <span className="text-navy dark:text-slate-200">
            {klassifikation?.q2PdBetroffen === 'ja'
              ? 'Ja'
              : klassifikation?.q2PdBetroffen === 'nein'
              ? 'Nein'
              : '—'}
          </span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 dark:text-slate-400 w-40 shrink-0">Angreifer aktiv</span>
          <span className="text-navy dark:text-slate-200">
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
      <div className="bg-lightgray dark:bg-slate-800 rounded-lg p-4 space-y-3 print-section">
        <h3 className="text-base font-bold text-navy dark:text-white">Massnahmen-Fortschritt</h3>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 dark:text-slate-400 w-40 shrink-0">Checkliste Reaktion</span>
          <span className="text-navy dark:text-slate-200">{completedCount} von {totalSteps} Massnahmen erledigt</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
          <div
            className="bg-navy h-2 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-sm">
          {totalSteps === 0 ? (
            <span className="text-gray-500">Keine Massnahmen definiert</span>
          ) : completedCount < totalSteps ? (
            <span className="text-amber-800 dark:text-amber-400">
              {totalSteps - completedCount} Massnahmen ausstehend
            </span>
          ) : (
            <span className="text-navy dark:text-slate-200">Alle Massnahmen abgeschlossen</span>
          )}
        </div>
      </div>

      {/* Section 5: Meldepflichten */}
      <div className="bg-lightgray dark:bg-slate-800 rounded-lg p-4 space-y-3 print-section">
        <h3 className="text-base font-bold text-navy dark:text-white">Meldepflichten</h3>
        {(() => {
          const erkannt = erfassen?.erkennungszeitpunkt
          const fmtDeadline = (hours: number) => {
            if (!erkannt) return `Ja — ${hours}h Frist (Zeitpunkt fehlt)`
            const d = new Date(new Date(erkannt).getTime() + hours * 60 * 60 * 1000)
            return `Ja — bis ${d.toLocaleString('de-CH', { dateStyle: 'short', timeStyle: 'short' })} (${hours}h Frist)`
          }
          return (
            <>
              <div className="flex gap-2 text-sm">
                <span className="text-gray-500 dark:text-slate-400 w-44 shrink-0">ISG/NCSC (24h)</span>
                <span className="text-navy dark:text-slate-200">
                  {kommunikation?.kritischeInfrastruktur === 'ja'
                    ? fmtDeadline(24)
                    : kommunikation?.kritischeInfrastruktur === 'nein'
                    ? 'Nein'
                    : '—'}
                </span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-gray-500 dark:text-slate-400 w-44 shrink-0">DSG/DSGVO</span>
                <span className="text-navy dark:text-slate-200">
                  {kommunikation?.personendatenBetroffen === 'ja'
                    ? 'Ja — unverzüglich melden (keine feste Frist)'
                    : kommunikation?.personendatenBetroffen === 'nein'
                    ? 'Nein'
                    : '—'}
                </span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-gray-500 dark:text-slate-400 w-44 shrink-0">FINMA (24h/72h)</span>
                <span className="text-navy dark:text-slate-200">
                  {kommunikation?.reguliertesUnternehmen === 'ja'
                    ? fmtDeadline(24) + ' (informell) / ' + (erkannt
                        ? new Date(new Date(erkannt).getTime() + 72 * 60 * 60 * 1000).toLocaleString('de-CH', { dateStyle: 'short', timeStyle: 'short' }) + ' (vollständig)'
                        : '72h (vollständig)')
                    : kommunikation?.reguliertesUnternehmen === 'nein'
                    ? 'Nein'
                    : '—'}
                </span>
              </div>
            </>
          )
        })()}
      </div>

      {/* Section 6: Kommunikation */}
      <div className="bg-lightgray dark:bg-slate-800 rounded-lg p-4 space-y-3 print-section">
        <h3 className="text-base font-bold text-navy dark:text-white">Kommunikation</h3>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 dark:text-slate-400 w-40 shrink-0">Kommunikations-Checkliste</span>
          <span className="text-navy dark:text-slate-200">
            {kommunikation?.kommChecklist?.length && kommunikation.kommChecklist.length > 0
              ? kommunikation.kommChecklist.join(', ')
              : '—'}
          </span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 dark:text-slate-400 w-40 shrink-0">GL-Vorlage</span>
          <span className="text-navy dark:text-slate-200">{kommunikation?.templateGL ? 'Erstellt' : '—'}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 dark:text-slate-400 w-40 shrink-0">Mitarbeitende-Vorlage</span>
          <span className="text-navy dark:text-slate-200">{kommunikation?.templateMitarbeitende ? 'Erstellt' : '—'}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 dark:text-slate-400 w-40 shrink-0">Medien-Vorlage</span>
          <span className="text-navy dark:text-slate-200">{kommunikation?.templateMedien ? 'Erstellt' : '—'}</span>
        </div>
      </div>

      {/* Nächste Schritte */}
      <div className="bg-lightgray rounded-lg p-4 space-y-2 print-section">
        <h3 className="text-base font-bold text-navy dark:text-white">Nächste Schritte</h3>
        <ul className="space-y-2 text-sm text-navy list-disc list-inside">
          <li>Bericht an SIAG-Berater übergeben (siehe unten)</li>
          <li>Offene Meldepflichten fristgerecht einhalten</li>
          <li>Ausstehende Reaktionsmassnahmen abschliessen</li>
          <li>Post-Incident-Review innerhalb von 72 Stunden durchführen</li>
          <li>Lessons Learned dokumentieren und Prozesse anpassen</li>
        </ul>
      </div>

      {/* SIAG Handoff CTA */}
      <div className="bg-navy text-white rounded-lg p-6 space-y-4 print-section">
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
        <button
          type="button"
          onClick={handlePrint}
          className="bg-white text-navy px-4 py-3 rounded-lg text-sm font-medium min-h-[44px] hover:bg-gray-100 transition-colors print:hidden w-full sm:w-auto"
        >
          Bericht für GL/VR exportieren (PDF)
        </button>
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
