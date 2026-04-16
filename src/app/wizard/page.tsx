import { WizardShell } from '@/components/wizard'

export const metadata = {
  title: 'Wizard -- SIAG Incident Assistant',
  description: 'Incident-Response-Wizard fortsetzen',
}

interface WizardPageProps {
  searchParams: Promise<{ incident?: string }>
}

export default async function WizardPage({ searchParams }: WizardPageProps) {
  const params = await searchParams
  return (
    <main>
      <WizardShell incidentId={params.incident} />
    </main>
  )
}
