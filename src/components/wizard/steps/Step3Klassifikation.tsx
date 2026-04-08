'use client'

import { useEffect } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { StepForm } from '../StepForm'
import { klassifikationSchema, calculateSeverity } from '@/lib/wizard-schemas'
import type { KlassifikationData } from '@/lib/wizard-types'

const QUESTIONS = [
  {
    key: 'q1SystemeBetroffen' as const,
    number: 1,
    text: 'Sind kritische Geschaeftssysteme betroffen oder verschluesselt?',
    options: [
      { value: 'ja' as const, label: 'Ja' },
      { value: 'nein' as const, label: 'Nein' },
    ],
  },
  {
    key: 'q2PdBetroffen' as const,
    number: 2,
    text: 'Sind personenbezogene Daten betroffen oder potenziell abgeflossen?',
    options: [
      { value: 'ja' as const, label: 'Ja' },
      { value: 'nein' as const, label: 'Nein' },
    ],
  },
  {
    key: 'q3AngreiferAktiv' as const,
    number: 3,
    text: 'Ist der Angreifer noch aktiv im Netzwerk?',
    options: [
      { value: 'ja' as const, label: 'Ja' },
      { value: 'nein' as const, label: 'Nein' },
      { value: 'unbekannt' as const, label: 'Unbekannt' },
    ],
  },
] as const

const INCIDENT_TYPE_OPTIONS = [
  { value: 'ransomware' as const, label: 'Ransomware' },
  { value: 'phishing' as const, label: 'Phishing' },
  { value: 'ddos' as const, label: 'DDoS' },
  { value: 'datenverlust' as const, label: 'Datenverlust' },
  { value: 'sonstiges' as const, label: 'Sonstiges' },
] as const

function KlassifikationForm({ form }: { form: UseFormReturn<KlassifikationData> }) {
  const q1 = form.watch('q1SystemeBetroffen')
  const q2 = form.watch('q2PdBetroffen')
  const q3 = form.watch('q3AngreiferAktiv')
  const allAnswered = q1 && q2 && q3
  const computedSeverity = allAnswered ? calculateSeverity(q1, q2, q3) : null

  // Reactively compute and store severity when all questions answered (per D-02, D-04)
  useEffect(() => {
    if (allAnswered) {
      const sev = calculateSeverity(q1, q2, q3)
      form.setValue('severity', sev, { shouldValidate: true })
    }
  }, [q1, q2, q3, allAnswered, form])

  // Default incidentType to 'ransomware' if not set (per F5.3)
  useEffect(() => {
    if (!form.getValues('incidentType')) {
      form.setValue('incidentType', 'ransomware')
    }
  }, [form])

  return (
    <div className="space-y-6">
      {/* Hidden fields for Zod validation (per Pitfall 6 — pill buttons use setValue, not native input) */}
      <input type="hidden" {...form.register('q1SystemeBetroffen')} />
      <input type="hidden" {...form.register('q2PdBetroffen')} />
      <input type="hidden" {...form.register('q3AngreiferAktiv')} />
      <input type="hidden" {...form.register('severity')} />

      {/* 3 Question Cards */}
      {QUESTIONS.map((question) => {
        const currentValue = form.watch(question.key)
        return (
          <div key={question.key} className="bg-lightgray rounded-lg p-6">
            <p className="text-sm font-normal text-gray-500 mb-1">Frage {question.number} von 3</p>
            <p className="text-base font-bold text-navy mb-4">{question.text}</p>
            <div className="flex gap-3 flex-wrap">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    form.setValue(question.key, option.value, { shouldValidate: true })
                  }
                  className={
                    currentValue === option.value
                      ? 'bg-navy text-white px-6 py-3 rounded-lg font-bold min-h-[44px]'
                      : 'bg-white border border-gray-300 text-navy px-6 py-3 rounded-lg font-normal min-h-[44px] hover:border-navy transition-colors'
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
            {form.formState.errors[question.key] && (
              <p className="text-sm text-red-600 mt-2">
                {form.formState.errors[question.key]?.message as string}
              </p>
            )}
          </div>
        )
      })}

      {/* Severity Result Display — shown after all 3 questions answered */}
      {computedSeverity && (
        <div
          className={
            computedSeverity === 'KRITISCH'
              ? 'border-l-4 border-amber bg-amber/10 rounded-r-lg p-6'
              : computedSeverity === 'HOCH'
                ? 'border-l-4 border-navy bg-lightgray rounded-r-lg p-6'
                : 'border-l-4 border-gray-400 bg-lightgray rounded-r-lg p-6'
          }
        >
          <span
            className={
              computedSeverity === 'KRITISCH'
                ? 'inline-block bg-amber text-white text-sm font-bold px-3 py-1 rounded-full uppercase'
                : computedSeverity === 'HOCH'
                  ? 'inline-block bg-navy text-white text-sm font-bold px-3 py-1 rounded-full uppercase'
                  : 'inline-block bg-gray-500 text-white text-sm font-bold px-3 py-1 rounded-full uppercase'
            }
          >
            {computedSeverity}
          </span>
          <p className="text-base font-normal text-navy mt-2">
            {computedSeverity === 'KRITISCH'
              ? 'Sofortige Eskalation erforderlich. SIAG-Berater einbeziehen.'
              : computedSeverity === 'HOCH'
                ? 'Erhoehte Aufmerksamkeit. Datenschutzrelevanz pruefen.'
                : 'Standardprozess. Dokumentation und Beobachtung.'}
          </p>
        </div>
      )}

      {/* KRITISCH Escalation Alert (per UI-SPEC, F5.4) */}
      {computedSeverity === 'KRITISCH' && (
        <div className="border-2 border-amber bg-amber/10 rounded-lg p-6 text-center">
          <p className="text-3xl">&#9888;</p>
          <p className="text-base font-bold text-navy mt-2">Schweregrad Kritisch</p>
          <p className="text-base text-navy mt-1">
            SIAG-Berater sofort einbeziehen. Eskalieren Sie umgehend an die Geschaeftsleitung.
          </p>
          <p className="text-sm text-gray-500 mt-3">Der Kontakt zu SIAG erfolgt im letzten Schritt.</p>
        </div>
      )}

      {/* Incident-Typ Radio Group */}
      <div className="space-y-2">
        <label className="text-sm font-normal text-navy mb-1 block">Incident-Typ</label>
        {INCIDENT_TYPE_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              form.watch('incidentType') === option.value
                ? 'border-navy bg-lightgray'
                : 'border-gray-200 hover:border-navy'
            }`}
          >
            <input
              type="radio"
              value={option.value}
              {...form.register('incidentType')}
              className="w-5 h-5 accent-navy"
            />
            <span className="text-sm text-navy">{option.label}</span>
          </label>
        ))}
        {form.formState.errors.incidentType && (
          <p className="text-sm text-red-600 mt-2">
            {form.formState.errors.incidentType?.message as string}
          </p>
        )}
      </div>
    </div>
  )
}

export function Step3Klassifikation() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy">Klassifikation & Schweregrad</h2>
      <p className="text-base text-gray-600 leading-relaxed">
        Beantworten Sie drei Fragen zur Einschaetzung des Vorfalls. Der Schweregrad wird automatisch
        bestimmt.
      </p>
      <StepForm stepKey="klassifikation" schema={klassifikationSchema}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(form) => <KlassifikationForm form={form as unknown as UseFormReturn<KlassifikationData>} />}
      </StepForm>
    </div>
  )
}
