import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MigrationInitializer } from "@/components/MigrationInitializer";

// Load Source Sans Pro from Google Fonts
const sourceSansPro = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap", // Show fallback while loading
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "SIAG Incident Management Assistent",
  description: "Incident-Response-Wizard fuer SIAG-Berater",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      suppressHydrationWarning
      className={sourceSansPro.variable}
    >
      <body className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors">
        <MigrationInitializer />
        <Header />
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
