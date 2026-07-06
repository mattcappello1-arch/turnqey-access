const BASE = process.env.TURNQEY_API_URL ?? "https://turnqey.com.au";

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function call<T>(path: string, apiKey: string, options?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: body || `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Request failed" };
  }
}

export async function listLocks(apiKey: string) {
  return call<{ locks: unknown[] }>("/api/public/v1/locks", apiKey);
}

export async function unlockDoor(apiKey: string, lockId: string) {
  return call<{ success: boolean }>(`/api/public/v1/locks/${lockId}/unlock`, apiKey, { method: "POST" });
}

export async function lockDoor(apiKey: string, lockId: string) {
  return call<{ success: boolean }>(`/api/public/v1/locks/${lockId}/lock`, apiKey, { method: "POST" });
}

export async function createAccessCode(apiKey: string, data: {
  lock_id: string;
  guest_name: string;
  code_type: "time_bound" | "ongoing" | "one_time";
  starts_at?: string;
  ends_at?: string;
}) {
  return call<{ access_code: unknown }>("/api/public/v1/access-codes", apiKey, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function revokeAccessCode(apiKey: string, codeId: string) {
  return call<{ success: boolean }>(`/api/public/v1/access-codes/${codeId}`, apiKey, { method: "DELETE" });
}
