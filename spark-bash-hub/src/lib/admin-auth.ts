import { getAdminPassword } from "./db";

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** True when the request carries the admin password in X-Admin-Key. */
export async function isAdminRequest(request: Request): Promise<boolean> {
  const key = request.headers.get("X-Admin-Key") ?? "";
  const password = await getAdminPassword();
  return !!password && !!key && safeEqual(key, password);
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
