import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Turnqey Access",
  description: "Enterprise access management for accommodation providers.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%230A0A0B'/><text x='50' y='68' font-family='sans-serif' font-size='48' font-weight='300' fill='%23F7F5F0' text-anchor='middle'>TA</text></svg>",
  },
  openGraph: {
    title: "Turnqey Access",
    description: "Enterprise access management for hotels, apartments, and accommodation providers. NFC, PIN codes, multi-zone access.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className="h-full">
      <body className="min-h-full flex flex-col bg-bg text-graphite" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
