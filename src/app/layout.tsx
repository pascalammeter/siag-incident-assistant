import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "SIAG Incident Management Assistent",
  description: "Incident-Response-Wizard fuer SIAG-Berater",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen flex flex-col bg-white text-navy">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
