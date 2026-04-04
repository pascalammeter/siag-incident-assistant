'use client'

import { type UseFormReturn } from 'react-hook-form'
import { StepForm } from '../StepForm'
import { useWizard } from '../WizardContext'
import { kommunikationSchema } from '@/lib/wizard-schemas'
import type { KommunikationData } from '@/lib/wizard-types'
import { computeDeadline, formatDeadline } from '@/lib/communication-templates'

const MELDEPFLICHT_QUESTIONS = [
  {
    key: 'kritischeInfrastruktur' as const,
    text: 'Betreiben Sie kritische Infrastruktur?',
  },
  {
    key: 'personendatenBetroffen' as const,
    text: 'Sind personenbezogene Daten betroffen?',
  },
  {
    key: 'reguliertesUnternehmen' as const,
    text: 'Sind Sie ein reguliertes Unternehmen (Bank/Versicherung/FMI)?',
  },
] as const

const KOMM_CHECKLIST_ITEMS = [
  { id: 'krisenstab', label: 'Krisenstab informiert' },
  { id: 'gl-vr', label: 'Geschaeftsleitung + Verwaltungsrat informiert' },
  { id: 'mitarbeitende', label: 'Mitarbeitende informiert' },
  { id: 'medien', label: 'Medien/Oeffentlichkeit (falls erforderlich)' },
  { id: 'kunden', label: 'Kunden informiert (falls betroffen)' },
  { id: 'partner', label: 'Partner/Lieferanten informiert (falls betroffen)' },
]

function KommunikationForm({ form }: { form: UseFormReturn<KommunikationData> }) {
  const { state } = useWizard()

  const kritisch = form.watch('kritischeInfrastruktur')
  const personen = form.watch('personendatenBetroffen')
  const reguliert = form.watch('reguliertesUnternehmen')
  const kommChecklist: string[] = form.watch('kommChecklist') ?? []

  const erkennungszeitpunkt = state.erfassen?.erkennungszeitpunkt

  // Build deadlines array conditionally
  const deadlines: Array<{ law: string; deadline: Date | null; badge?: string; text?: string; note?: string }> = []

  if (kritisch === 'ja') {
    if (erkennungszeitpunkt) {
      deadlines.push({ law: 'ISG \u2014 NCSC-Meldung', deadline: computeDeadline(erkennungszeitpunkt, 24), badge: '24h' })
    }
  }
  if (personen === 'ja') {
    deadlines.push({ law: 'DSG/DSGVO \u2014 FDPIC-Meldung', deadline: null, text: 'So schnell wie moeglich', note: 'Keine feste Frist \u2014 unverzueglich nach Kenntnis.' })
  }
  if (reguliert === 'ja') {
    if (erkennungszeitpunkt) {
      deadlines.push(
        { law: 'FINMA \u2014 Informelle Meldung', deadline: computeDeadline(erkennungszeitpunkt, 24), badge: '24h' },
        { law: 'FINMA \u2014 Vollstaendige Meldung', deadline: computeDeadline(erkennungszeitpunkt, 72), badge: '72h' },
      )
    }
  }

  // Detect missing erkennungszeitpunkt for time-based obligations
  const needsTimeBasedDeadline = kritisch === 'ja' || reguliert === 'ja'
  const missingErkennungszeitpunkt = needsTimeBasedDeadline && !erkennungszeitpunkt

  // All-Nein detection
  const allAnswered = kritisch !== null && kritisch !== undefined &&
    personen !== null && personen !== undefined &&
    reguliert !== null && reguliert !== undefined
  const allNein = allAnswered && kritisch === 'nein' && personen === 'nein' && reguliert === 'nein'

  const toggleChecklist = (itemId: string) => {
    const current = kommChecklist ?? []
    const newArray = current.includes(itemId)
      ? current.filter((id) => id !== itemId)
      : [...current, itemId]
    form.setValue('kommChecklist', newArray)
  }

  return (
    <div className="space-y-8">
      {/* Hidden inputs for Zod validation */}
      <input type="hidden" {...form.register('kritischeInfrastruktur')} />
      <input type="hidden" {...form.register('personendatenBetroffen')} />
      <input type="hidden" {...form.register('reguliertesUnternehmen')} />

      {/* MELDEPFLICHT QUESTIONS */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-navy">Meldepflichten pruefen</h3>
        {MELDEPFLICHT_QUESTIONS.map((question) => {
          const currentValue = form.watch(question.key)
          return (
            <div key={question.key} className="bg-lightgray rounded-lg p-6 space-y-3">
              <p className="text-base font-bold text-navy">{question.text}</p>
              <div className="flex gap-3">
                {(['ja', 'nein'] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      form.setValue(question.key, value, { shouldValidate: true })
                    }
                    className={
                      currentValue === value
                        ? 'bg-navy text-white px-6 py-3 rounded-lg font-normal min-h-[44px]'
                        : 'bg-white border border-gray-300 text-navy px-6 py-3 rounded-lg font-normal min-h-[44px] hover:border-navy transition-colors'
                    }
                  >
                    {value === 'ja' ? 'Ja' : 'Nein'}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* DEADLINE DISPLAY */}
      {deadlines.length > 0 && (
        <div className="space-y-3">
          {deadlines.map((d) => (
            <div key={d.law} className="bg-navy text-white rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-normal opacity-80">{d.law}</p>
                  <p className="text-base font-bold">
                    {d.deadline ? `Frist bis: ${formatDeadline(d.deadline)}` : d.text}
                  </p>
                  {d.note && <p className="text-sm opacity-80 mt-1">{d.note}</p>}
                </div>
                {d.badge && <span className="text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full">{d.badge}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Missing erkennungszeitpunkt warning */}
      {missingErkennungszeitpunkt && (
        <div className="border-l-4 border-amber bg-amber/10 rounded-r-lg p-4">
          <p className="text-sm font-normal text-navy">
            <span className="mr-2">&#9888;</span>
            Erkennungszeitpunkt nicht erfasst. Bitte Schritt 2 vervollstaendigen.
          </p>
        </div>
      )}

      {/* All-Nein empty state */}
      {allNein && (
        <p className="text-sm text-gray-600">
          Keine gesetzlichen Meldepflichten identifiziert. Dokumentieren Sie den Vorfall dennoch sorgfaeltig.
        </p>
      )}

      {/* KOMMUNIKATIONS-CHECKLISTE */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-navy">Kommunikations-Checkliste</h3>
        {KOMM_CHECKLIST_ITEMS.map((item) => (
          <label key={item.id} className="flex items-center gap-3 p-3 bg-lightgray rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={kommChecklist.includes(item.id)}
              onChange={() => toggleChecklist(item.id)}
              className="w-5 h-5 accent-navy shrink-0"
            />
            <span className="text-sm text-navy">{item.label}</span>
          </label>
        ))}
      </div>

      {/* === Kommunikationsbausteine section (Plan 04) === */}

      {/* SIAG CTA BLOCK */}
      <div className="border-2 border-navy bg-lightgray rounded-lg p-6 text-center space-y-4">
        <p className="text-lg font-bold text-navy">SIAG-Berater jetzt einbeziehen</p>
        <p className="text-base text-gray-600">
          Unsere Incident-Response-Spezialisten unterstuetzen Sie bei der Bewaeltigung.
        </p>
        <div className="bg-white rounded-lg p-4 inline-block text-left space-y-2">
          <p className="text-sm text-navy"><span className="font-bold">Telefon:</span> +41 XX XXX XX XX</p>
          <p className="text-sm text-navy"><span className="font-bold">E-Mail:</span> incident@siag.ch</p>
        </div>
        <p className="text-xs text-gray-400">Kontaktdaten werden vor Go-Live aktualisiert.</p>
      </div>
    </div>
  )
}

export function Step5Kommunikation() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy">Kommunikation & Eskalation</h2>
      <p className="text-base text-gray-600 leading-relaxed">
        Pruefen Sie gesetzliche Meldepflichten und planen Sie die interne und externe Kommunikation.
      </p>
      <StepForm stepKey="kommunikation" schema={kommunikationSchema}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(form) => <KommunikationForm form={form as unknown as UseFormReturn<KommunikationData>} />}
      </StepForm>
    </div>
  )
}
