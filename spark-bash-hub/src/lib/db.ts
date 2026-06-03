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
  const env = (ctx as any)?.cloudflare?.env ?? (ctx as any)?.env ?? {};
  return (
    env?.ADMIN_PASSWORD ||
    env?.VITE_ADMIN_PASSWORD ||
    (typeof process !== "undefined"
      ? process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD
      : undefined)
  );
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
