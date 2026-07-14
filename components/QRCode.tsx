"use client";

// Simple QR code generator using a public API
// In production, use a library like qrcode.react
export function QRCode({ url, size = 160 }: { url: string; size?: number }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=F7F5F0&color=0A0A0B&margin=0`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={qrUrl}
      alt="QR Code"
      width={size}
      height={size}
      style={{ borderRadius: 8 }}
    />
  );
}
