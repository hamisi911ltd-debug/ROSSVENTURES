import type { EventRow } from "./types";

export type D1DB = any;
export type R2Bucket = any;

export function extractDB(ctx: unknown): D1DB | null {
  const env = (ctx as any)?.cloudflare?.env ?? (ctx as any)?.env ?? {};
  return env?.DB ?? null;
}

export function extractR2(ctx: unknown): R2Bucket | null {
  const env = (ctx as any)?.cloudflare?.env ?? (ctx as any)?.env ?? {};
  return env?.IMAGES ?? null;
}

export function getAdminPassword(ctx: unknown): string | undefined {
  // 1. Runtime Worker secrets / vars (set via wrangler secret put)
  const env = (ctx as any)?.cloudflare?.env ?? (ctx as any)?.env ?? {};
  if (env?.ADMIN_PASSWORD) return env.ADMIN_PASSWORD;
  if (env?.VITE_ADMIN_PASSWORD) return env.VITE_ADMIN_PASSWORD;
  // 2. Vite build-time env vars (embedded in bundle from .dev.vars / .env)
  const vitePw = (import.meta as any)?.env?.VITE_ADMIN_PASSWORD;
  if (vitePw) return vitePw;
  const viteAp = (import.meta as any)?.env?.ADMIN_PASSWORD;
  if (viteAp) return viteAp;
  // 3. Node process env (local dev fallback)
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
