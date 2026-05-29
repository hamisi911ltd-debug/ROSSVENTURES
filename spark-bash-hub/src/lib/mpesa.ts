// Safaricom Daraja M-Pesa STK Push integration
// Credentials via Cloudflare Worker env vars (set via wrangler secret put):
//   MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY

export type StkPushResult =
  | { ok: true; checkoutRequestId: string; merchantRequestId: string }
  | { ok: false; error: string };

export type CallbackResult = {
  resultCode: number;
  resultDesc: string;
  checkoutRequestId: string;
  mpesaReceiptNumber: string | null;
  amount: number | null;
  phoneNumber: string | null;
};

function getCredentials(env: Record<string, string | undefined>) {
  return {
    consumerKey: env.MPESA_CONSUMER_KEY,
    consumerSecret: env.MPESA_CONSUMER_SECRET,
    shortCode: env.MPESA_SHORTCODE,
    passkey: env.MPESA_PASSKEY,
  };
}

function isConfigured(env: Record<string, string | undefined>) {
  const { consumerKey, consumerSecret, shortCode, passkey } = getCredentials(env);
  return !!(consumerKey && consumerSecret && shortCode && passkey);
}

async function getAccessToken(consumerKey: string, consumerSecret: string): Promise<string> {
  const credentials = btoa(`${consumerKey}:${consumerSecret}`);
  const res = await fetch(
    "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${credentials}` } },
  );
  if (!res.ok) throw new Error(`Daraja auth failed: ${res.status}`);
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

function generatePassword(shortCode: string, passkey: string, timestamp: string): string {
  return btoa(`${shortCode}${passkey}${timestamp}`);
}

function getTimestamp(): string {
  return new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
}

function normalizePhone(phone: string): string {
  // Convert +254XXXXXXXXX or 07XXXXXXXX or 254XXXXXXXXX → 2547XXXXXXXX
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`;
  return digits;
}

export async function initiateStkPush(
  phone: string,
  amount: number,
  bookingId: string,
  callbackBaseUrl: string,
  env: Record<string, string | undefined>,
): Promise<StkPushResult> {
  if (!isConfigured(env)) {
    // Simulation mode — auto-complete after a few seconds on the client side
    return {
      ok: true,
      checkoutRequestId: `SIM_${bookingId}_${Date.now()}`,
      merchantRequestId: `SIM_MR_${Date.now()}`,
    };
  }

  const { consumerKey, consumerSecret, shortCode, passkey } = getCredentials(env);
  try {
    const token = await getAccessToken(consumerKey!, consumerSecret!);
    const timestamp = getTimestamp();
    const password = generatePassword(shortCode!, passkey!, timestamp);
    const callbackUrl = `${callbackBaseUrl}/api/mpesa/callback`;

    const body = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(amount),
      PartyA: normalizePhone(phone),
      PartyB: shortCode,
      PhoneNumber: normalizePhone(phone),
      CallBackURL: callbackUrl,
      AccountReference: `RV-${bookingId.slice(0, 8).toUpperCase()}`,
      TransactionDesc: `Ross Ventures Ticket ${bookingId.slice(0, 8).toUpperCase()}`,
    };

    const res = await fetch(
      "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await res.json() as any;
    if (data.ResponseCode === "0") {
      return {
        ok: true,
        checkoutRequestId: data.CheckoutRequestID,
        merchantRequestId: data.MerchantRequestID,
      };
    }
    return { ok: false, error: data.errorMessage ?? data.ResponseDescription ?? "STK Push failed" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export function parseCallback(body: unknown): CallbackResult {
  const b = body as any;
  const stkCallback = b?.Body?.stkCallback ?? {};
  const resultCode: number = stkCallback.ResultCode ?? -1;
  const resultDesc: string = stkCallback.ResultDesc ?? "Unknown";
  const checkoutRequestId: string = stkCallback.CheckoutRequestID ?? "";

  let mpesaReceiptNumber: string | null = null;
  let amount: number | null = null;
  let phoneNumber: string | null = null;

  if (resultCode === 0) {
    const items: any[] = stkCallback.CallbackMetadata?.Item ?? [];
    for (const item of items) {
      if (item.Name === "MpesaReceiptNumber") mpesaReceiptNumber = String(item.Value);
      if (item.Name === "Amount") amount = Number(item.Value);
      if (item.Name === "PhoneNumber") phoneNumber = String(item.Value);
    }
  }

  return { resultCode, resultDesc, checkoutRequestId, mpesaReceiptNumber, amount, phoneNumber };
}

export function getEnvFromContext(ctx: unknown): Record<string, string | undefined> {
  const env = (ctx as any)?.cloudflare?.env ?? (ctx as any)?.env ?? {};
  // Also try process.env (available with nodejs_compat)
  const penv = typeof process !== "undefined" ? process.env : {};
  return {
    MPESA_CONSUMER_KEY: env.MPESA_CONSUMER_KEY ?? penv.MPESA_CONSUMER_KEY,
    MPESA_CONSUMER_SECRET: env.MPESA_CONSUMER_SECRET ?? penv.MPESA_CONSUMER_SECRET,
    MPESA_SHORTCODE: env.MPESA_SHORTCODE ?? penv.MPESA_SHORTCODE,
    MPESA_PASSKEY: env.MPESA_PASSKEY ?? penv.MPESA_PASSKEY,
  };
}
