import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
