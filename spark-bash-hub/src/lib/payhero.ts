// FinoQ / PayHero (docs.finoq.africa) M-Pesa collection integration.
//
// Worker secrets (wrangler secret put <NAME>):
//   PAYHERO_API_USERNAME + PAYHERO_API_PASSWORD   (or PAYHERO_AUTH_TOKEN = the full "Basic xxxx" header value)
//   PAYHERO_ACCOUNT_ID                            (your FinoQ/PayHero account id)
//   PAYHERO_CHANNEL_ID                            (optional: pin a till/paybill/bank channel. Leave UNSET so
//                                                  collections are wallet-based and settle to the payments wallet)
//   PAYHERO_NETWORK_CODE                          (optional, wallet mode only; default "63902" = M-Pesa)
//   PAYHERO_CALLBACK_SECRET                       (random string that signs callback URLs)
//
// Written against the v2 API (POST /payments, JSON callback). All provider-specific field
// names live in this file only.

import { getEnvVar } from "./runtime-env";

const DEFAULT_BASE_URL = "https://api.finoq.africa/api/v2";

// PAYHERO_BASE_URL exists so the flow can be tested against a mock server
async function baseUrl(): Promise<string> {
  return (await getEnvVar("PAYHERO_BASE_URL")) ?? DEFAULT_BASE_URL;
}

// Host root (the status endpoint lives under /api/global, not /api/v2)
async function apiRoot(): Promise<string> {
  return (await baseUrl()).replace(/\/api\/v2\/?$/, "");
}

export type PaymentState = "paid" | "failed" | "pending";

export type StkResult =
  | { ok: true; reference: string; checkoutRequestId: string | null }
  | { ok: false; error: string; detail?: string };

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
  return !!(await authHeader()) && !!(await getEnvVar("PAYHERO_ACCOUNT_ID"));
}

export function splitName(full: string): { first: string; last: string } {
  const parts = String(full ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { first: parts[0] ?? "", last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

/** Customer-safe wording for provider errors (the raw provider text is not shown to buyers). */
function friendlyError(data: any): string {
  const code = String(data?.error_code ?? "");
  const msg = String(data?.error_message ?? data?.message ?? data?.error ?? "");
  if (code === "kyc_third_party_collection")
    return "M-Pesa prompts to this number are not switched on yet. Please call +254 705 333 198 and we will help you complete your booking.";
  if (/insufficient/i.test(msg)) return "Payments are temporarily unavailable. Please try again shortly or call +254 705 333 198.";
  if (/last name|first name|customer\./i.test(msg)) return "Please check that you entered your first and last name, then try again.";
  if (/phone|number/i.test(msg)) return "That phone number was not accepted. Use your M-Pesa number, like 0712 345 678.";
  return "Could not start the M-Pesa prompt. Please try again, or call +254 705 333 198.";
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
  customerEmail?: string;
  origin: string;
}): Promise<StkResult> {
  const { first, last } = splitName(args.customerName);
  const auth = await authHeader();
  // All collections are pinned to the GLOTECH till channel (ID 9888, till 3452329) unless overridden.
  const channelId = (await getEnvVar("PAYHERO_CHANNEL_ID")) ?? "9888";
  const accountId = await getEnvVar("PAYHERO_ACCOUNT_ID");
  const token = await callbackToken(args.bookingId);
  if (!auth || !accountId || !token) return { ok: false, error: "Payments are not configured" };

  // Wallet collection (default): money is credited to the account's payments wallet, no channel routing.
  // Channel collection: only when PAYHERO_CHANNEL_ID is explicitly set.
  const route = channelId
    ? { provider: "m-pesa", channel_id: Number(channelId) }
    : { provider: "sasapay", network_code: (await getEnvVar("PAYHERO_NETWORK_CODE")) ?? "63902" };

  const base = {
    amount: Math.round(args.amount),
    phone_number: args.phone,
    ...route,
    account_id: Number(accountId),
    external_reference: args.bookingId,
    callback_url: `${args.origin}/api/payhero/callback?b=${encodeURIComponent(args.bookingId)}&t=${token}`,
  };

  // The provider validates a "customer" on some account types but documents the field shape poorly.
  // Try the plain request first, then richer customer shapes - but only ever after an explicit
  // validation rejection, so a prompt can never be sent twice.
  const full = args.customerName.trim();
  const email = args.customerEmail;
  const shapes: Record<string, unknown>[] = [
    { customer: { first_name: first, last_name: last, email, phone: args.phone } },
    { first_name: first, last_name: last, email },
    { customer_name: full, customer_email: email, customer_phone: args.phone },
    { customer: { name: full, first_name: first, last_name: last, email, phone: args.phone, country: "KE" } },
  ];

  const notes: string[] = [];
  for (const extra of shapes) {
    try {
      const res = await fetch(`${await baseUrl()}/payments`, {
        method: "POST",
        headers: { Authorization: auth, "Content-Type": "application/json" },
        body: JSON.stringify({ ...base, ...extra }),
      });
      const data = (await res.json().catch(() => ({}))) as any;
      if (res.ok && data?.success !== false && data?.reference) {
        return {
          ok: true,
          reference: String(data.reference),
          checkoutRequestId: data.CheckoutRequestID ? String(data.CheckoutRequestID) : null,
        };
      }
      const raw = String(data?.error_message ?? data?.message ?? data?.error ?? `HTTP ${res.status}`);
      notes.push(raw.slice(0, 160));
      // Only a customer-field validation rejection is worth retrying with another shape
      if (!/customer|first.?name|last.?name|validation failed/i.test(raw)) return { ok: false, error: friendlyError(data), detail: raw.slice(0, 200) };
    } catch {
      return { ok: false, error: "Could not reach the payment provider" };
    }
  }
  return {
    ok: false,
    error: "We could not start the M-Pesa prompt for your booking. Please call +254 705 333 198 and we will complete it with you.",
    detail: notes.join(" | ").slice(0, 300),
  };
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
    const res = await fetch(`${await apiRoot()}/api/global/transaction-status`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: reference }),
    });
    if (!res.ok) return { ok: false };
    const raw = (await res.json()) as any;
    const d = raw?.data && typeof raw.data === "object" ? raw.data : raw;
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
  const rawAmount = r.Amount ?? r.amount;
  const amount = rawAmount !== undefined && rawAmount !== null ? Number(rawAmount) : null;
  const receipt = r.MpesaReceiptNumber ?? r.provider_reference ?? r.transaction_id ?? null;
  return {
    state,
    bookingId: String(r.ExternalReference ?? r.external_reference ?? ""),
    checkoutRequestId: r.CheckoutRequestID ?? r.checkout_request_id ? String(r.CheckoutRequestID ?? r.checkout_request_id) : null,
    receipt: receipt ? String(receipt) : null,
    amount: amount !== null && Number.isFinite(amount) ? amount : null,
  };
}
