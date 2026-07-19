import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Turnqey Access",
  description: "Enterprise access management for accommodation providers.",
  icons: {
    icon: "/icon.svg",
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
