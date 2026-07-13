import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.webhook_secret) {
    return NextResponse.json({ error: "webhook_secret required" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://access.turnqey.com.au";

  // Send a test event to our own webhook endpoint
  try {
    const res = await fetch(`${baseUrl}/api/pms/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": body.webhook_secret,
      },
      body: JSON.stringify({
        event_type: "reservation.created",
        reservation_id: `TEST-${Date.now()}`,
        guest_name: "Test Guest",
        guest_email: "test@example.com",
        room_number: "101",
        check_in: new Date(Date.now() + 86400000).toISOString(),
        check_out: new Date(Date.now() + 86400000 * 3).toISOString(),
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      return NextResponse.json({ ok: true, message: "Test event sent. Check your guest stays for 'Test Guest'." });
    } else {
      return NextResponse.json({ ok: false, error: data.error || `HTTP ${res.status}` });
    }
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Request failed" });
  }
}
