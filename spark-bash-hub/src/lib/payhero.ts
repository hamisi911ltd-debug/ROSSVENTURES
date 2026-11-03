// PayHero (payhero.co.ke) M-Pesa STK Push integration.
//
// Worker secrets (wrangler secret put <NAME>):
//   PAYHERO_API_USERNAME + PAYHERO_API_PASSWORD   (or PAYHERO_AUTH_TOKEN = the full "Basic xxxx" header value)
//   PAYHERO_CHANNEL_ID                            (numeric payment channel id from the PayHero dashboard)
//   PAYHERO_CALLBACK_SECRET                       (optional; random string that signs callback URLs)
//
// Written against PayHero's v2 API (POST /payments, GET /transaction-status, JSON callback).
// All PayHero-specific field names live in this file only.

import { getEnvVar } from "./runtime-env";

const DEFAULT_BASE_URL = "https://backend.payhero.co.ke/api/v2";

// PAYHERO_BASE_URL exists so the flow can be tested against a mock server
async function baseUrl(): Promise<string> {
  return (await getEnvVar("PAYHERO_BASE_URL")) ?? DEFAULT_BASE_URL;
}

export type PaymentState = "paid" | "failed" | "pending";

export type StkResult =
  | { ok: true; reference: string; checkoutRequestId: string | null }
  | { ok: false; error: string };

export type StatusResult =
  | { ok: true; state: PaymentState; receipt: string | null; amount: number | null }
  | { ok: false };

export type ParsedCallback = {
  state: PaymentState;
  bookingId: string;
  checkoutRequestId: string | null;
  receipt: string | null;
  amount: number | null;
};

async function authHeader(): Promise<string | null> {
  const token = await getEnvVar("PAYHERO_AUTH_TOKEN");
  if (token) return token.startsWith("Basic ") ? token : `Basic ${token}`;
  const user = await getEnvVar("PAYHERO_API_USERNAME");
  const pass = await getEnvVar("PAYHERO_API_PASSWORD");
  if (user && pass) return `Basic ${btoa(`${user}:${pass}`)}`;
  return null;
}

export async function payheroConfigured(): Promise<boolean> {
  return !!(await authHeader()) && !!(await getEnvVar("PAYHERO_CHANNEL_ID"));
}

/** Kenyan mobile → local 07XXXXXXXX / 01XXXXXXXX. Returns null when not a valid number. */
export function normalizeKenyanPhone(input: string): string | null {
  const d = String(input ?? "").replace(/[\s\-()]/g, "").replace(/^\+/, "");
  const m = /^(?:254|0)?([17]\d{8})$/.exec(d);
  return m ? `0${m[1]}` : null;
}

// ─── Callback URL signing ─────────────────────────────────────────────────────
async function signingSecret(): Promise<string | null> {
  return (
    (await getEnvVar("PAYHERO_CALLBACK_SECRET")) ??
    (await getEnvVar("PAYHERO_API_PASSWORD")) ??
    (await getEnvVar("PAYHERO_AUTH_TOKEN")) ??
    null
  );
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function callbackToken(bookingId: string): Promise<string | null> {
  const secret = await signingSecret();
  return secret ? hmacHex(secret, `payhero-callback:${bookingId}`) : null;
}

export async function verifyCallbackToken(bookingId: string, token: string): Promise<boolean> {
  const expected = await callbackToken(bookingId);
  if (!expected || !token || expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}

// ─── STK push ─────────────────────────────────────────────────────────────────
export async function initiateStkPush(args: {
  bookingId: string;
  phone: string; // already normalised
  amount: number;
  customerName: string;
  origin: string;
}): Promise<StkResult> {
  const auth = await authHeader();
  const channelId = await getEnvVar("PAYHERO_CHANNEL_ID");
  const token = await callbackToken(args.bookingId);
  if (!auth || !channelId || !token) return { ok: false, error: "Payments are not configured" };

  const body = {
    amount: Math.round(args.amount),
    phone_number: args.phone,
    channel_id: Number(channelId),
    provider: "m-pesa",
    external_reference: args.bookingId,
    customer_name: args.customerName,
    callback_url: `${args.origin}/api/payhero/callback?b=${encodeURIComponent(args.bookingId)}&t=${token}`,
  };

  try {
    const res = await fetch(`${await baseUrl()}/payments`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as any;
    if (res.ok && data?.success !== false && data?.reference) {
      return {
        ok: true,
        reference: String(data.reference),
        checkoutRequestId: data.CheckoutRequestID ? String(data.CheckoutRequestID) : null,
      };
    }
    return { ok: false, error: String(data?.error_message ?? data?.message ?? data?.error ?? "Could not start the M-Pesa prompt") };
  } catch {
    return { ok: false, error: "Could not reach the payment provider" };
  }
}

// ─── Transaction status (server-side verification) ────────────────────────────
function toState(raw: unknown): PaymentState {
  const s = String(raw ?? "").toUpperCase();
  if (s === "SUCCESS" || s === "SUCCESSFUL" || s === "COMPLETED" || s === "PAID") return "paid";
  if (["FAILED", "CANCELLED", "CANCELED", "REJECTED", "TIMEOUT", "EXPIRED"].includes(s)) return "failed";
  return "pending";
}

export async function fetchPaymentStatus(reference: string): Promise<StatusResult> {
  const auth = await authHeader();
  if (!auth || !reference) return { ok: false };
  try {
    const res = await fetch(`${await baseUrl()}/transaction-status?reference=${encodeURIComponent(reference)}`, {
      headers: { Authorization: auth },
    });
    if (!res.ok) return { ok: false };
    const d = (await res.json()) as any;
    if (d?.status === undefined) return { ok: false };
    const receipt = d.provider_reference ?? d.mpesa_receipt_number ?? d.MpesaReceiptNumber ?? null;
    const amount = d.amount !== undefined && d.amount !== null ? Number(d.amount) : null;
    return {
      ok: true,
      state: toState(d.status),
      receipt: receipt ? String(receipt) : null,
      amount: amount !== null && Number.isFinite(amount) ? amount : null,
    };
  } catch {
    return { ok: false };
  }
}

// ─── Callback payload ─────────────────────────────────────────────────────────
export function parseCallback(body: unknown): ParsedCallback {
  const root = (body as any) ?? {};
  const r = root.response ?? root;
  const resultCode = r.ResultCode !== undefined ? Number(r.ResultCode) : NaN;
  const status = String(r.Status ?? r.status ?? "").toLowerCase();
  const state: PaymentState =
    resultCode === 0 || status === "success" ? "paid" : status === "queued" || status === "pending" ? "pending" : "failed";
  const amount = r.Amount !== undefined ? Number(r.Amount) : null;
  return {
    state,
    bookingId: String(r.ExternalReference ?? r.external_reference ?? ""),
    checkoutRequestId: r.CheckoutRequestID ? String(r.CheckoutRequestID) : null,
    receipt: r.MpesaReceiptNumber ? String(r.MpesaReceiptNumber) : null,
    amount: amount !== null && Number.isFinite(amount) ? amount : null,
  };
}
