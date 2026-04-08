export function Footer() {
  return (
    <footer className="bg-lightgray text-navy/60 text-sm px-6 py-4 text-center">
      <div className="max-w-4xl mx-auto">
        © {new Date().getFullYear()} Swiss Infosec AG — Incident Management Assistent
      </div>
    </footer>
  );
}
