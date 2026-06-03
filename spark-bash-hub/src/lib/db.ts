import type { EventRow } from "./types";

export type D1DB = any;
export type R2Bucket = any;

// srvx (TanStack Start's Cloudflare adapter) injects the Worker env at:
//   request.runtime.cloudflare.env
function getCFEnv(req: Request): any {
  return (req as any)?.runtime?.cloudflare?.env ?? {};
}

export function extractDB(req: Request): D1DB | null {
  return getCFEnv(req)?.DB ?? null;
}

export function extractR2(req: Request): R2Bucket | null {
  return getCFEnv(req)?.IMAGES ?? null;
}

export function getAdminPassword(req: Request): string | undefined {
  const env = getCFEnv(req);
  if (env?.ADMIN_PASSWORD) return env.ADMIN_PASSWORD;
  if (env?.VITE_ADMIN_PASSWORD) return env.VITE_ADMIN_PASSWORD;
  // Vite embeds VITE_ vars from .env at build time
  const vitePw = (import.meta as any)?.env?.VITE_ADMIN_PASSWORD;
  if (vitePw) return vitePw;
  if (typeof process !== "undefined") {
    return process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD;
  }
  return undefined;
}

export function rowToEvent(row: any): EventRow {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    venue: row.venue ?? "",
    event_date: row.event_date ?? "",
    tag: row.tag ?? "",
    is_published: row.is_published === 1 || row.is_published === true,
    created_at: row.created_at,
    poster_url: row.poster_key ? `/api/media/${row.poster_key}` : null,
    tiers: (() => { try { return JSON.parse(row.tiers_json ?? "[]"); } catch { return []; } })(),
  };
}
