import type { Metadata, Viewport } from "next";
import { Source_Sans_3 } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "@/lib/motion-config";
import { ToastContainer } from "@/components/Toast";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MigrationInitializer } from "@/components/MigrationInitializer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Load Source Sans 3 from Google Fonts via next/font for zero-CLS font loading.
// Preloads critical weights; display:swap prevents FOIT.
const sourceSansPro = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],  // Drop 500 — not used in design system
  variable: "--font-sans",
  display: "swap", // Show fallback while loading; CLS impact minimized by preload
  fallback: ["system-ui", "sans-serif"],
  preload: true,   // Emit <link rel="preload"> for critical font subset
});

export const metadata: Metadata = {
  title: "SIAG Incident Management Assistent",
  description: "Incident-Response-Wizard fuer SIAG-Berater — strukturierte Incident-Response gemaess ISG, DSG und FINMA",
  robots: { index: true, follow: true },
  openGraph: {
    title: "SIAG Incident Management Assistent",
    description: "Strukturierte Incident-Response fuer SIAG-Kunden",
    type: "website",
  },
};

// Separate viewport export (Next.js 14+ best practice — avoids Lighthouse warning)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
      <body className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <MotionConfig>
            <MigrationInitializer />
            {/* Skip link: keyboard users can jump past nav to main content */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-siag-navy focus:rounded focus:shadow-lg focus:outline-none"
            >
              Zum Hauptinhalt springen
            </a>
            <Header />
            <main id="main-content" className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
              {children}
            </main>
            <Footer />
            <ToastContainer />
          </MotionConfig>
        </ThemeProvider>
        {/* Vercel Analytics: tracks page views and custom events (free tier) */}
        <Analytics />
        {/* Vercel Speed Insights: tracks Core Web Vitals from real users */}
        <SpeedInsights />
      </body>
    </html>
  );
}
