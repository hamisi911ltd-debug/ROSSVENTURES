import type { EventRow } from "./types";

export type D1DB = any;
export type R2Bucket = any;

// In a Cloudflare Worker, bindings are accessible via the `cloudflare:workers`
// virtual module. The Cloudflare Vite Plugin externalises this so it is resolved
// at runtime by the Worker rather than bundled at build time.
let _cfEnv: any = null;

async function getCFEnv(): Promise<any> {
  if (_cfEnv) return _cfEnv;
  try {
    // @ts-ignore — cloudflare:workers is a Cloudflare runtime virtual module
    const { env } = await import("cloudflare:workers");
    _cfEnv = env;
    return env;
  } catch {
    return {};
  }
}

export async function extractDB(_req?: Request): Promise<D1DB | null> {
  const env = await getCFEnv();
  return env?.DB ?? null;
}

export async function extractR2(_req?: Request): Promise<R2Bucket | null> {
  const env = await getCFEnv();
  return env?.IMAGES ?? null;
}

export async function getAdminPassword(_req?: Request): Promise<string | undefined> {
  const env = await getCFEnv();
  if (env?.ADMIN_PASSWORD) return env.ADMIN_PASSWORD;
  if (env?.VITE_ADMIN_PASSWORD) return env.VITE_ADMIN_PASSWORD;
  // Fallback: Vite embeds VITE_ vars from .env at build time
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
