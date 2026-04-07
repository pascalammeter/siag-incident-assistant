import { ThemeToggle } from '@/components/atoms/ThemeToggle';

export function Header() {
  return (
    <header className="bg-siag-navy dark:bg-slate-900 text-white px-6 py-4 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/siag-logo.svg"
            alt="SIAG"
            className="h-8 w-auto"
          />
          <h1 className="text-lg font-semibold">Incident Management Assistent</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
