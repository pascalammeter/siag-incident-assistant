export function Header() {
  return (
    <header className="bg-navy text-white px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <img
          src="/siag-logo.svg"
          alt="SIAG"
          className="h-8 w-auto"
        />
        <h1 className="text-lg font-semibold">Incident Management Assistent</h1>
      </div>
    </header>
  );
}
