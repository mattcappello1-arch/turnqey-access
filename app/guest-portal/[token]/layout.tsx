import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Access — Turnqey",
  description: "Access your room with NFC or a PIN code. No app download required.",
  openGraph: {
    title: "Your Access — Turnqey",
    description: "Tap to unlock your room or use your PIN code. No app download required.",
    type: "website",
  },
  robots: "noindex, nofollow",
};

export default function GuestPortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
