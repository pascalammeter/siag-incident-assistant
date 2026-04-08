import Link from 'next/link';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';

export function Header() {
  return (
    <header className="bg-siag-navy dark:bg-slate-900 text-white px-6 py-4 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/siag-logo.svg"
            alt="SIAG Logo"
            className="h-8 w-auto"
          />
          <span className="text-lg font-semibold">Incident Management Assistent</span>
        </div>
        <nav aria-label="Hauptnavigation">
          <ul className="flex items-center gap-4 list-none m-0 p-0">
            <li>
              <Link
                href="/"
                className="text-white hover:text-slate-200 transition-colors underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Wizard
              </Link>
            </li>
            <li>
              <Link
                href="/incidents"
                className="text-white hover:text-slate-200 transition-colors underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Incidents
              </Link>
            </li>
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
