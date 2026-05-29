import type { EventRow, BookingRow } from "./types";

// ─── In-process singletons ────────────────────────────────────────────────────
// Cloudflare Workers isolates persist for hours; this acts as a fast cache and
// sole store when KV is not configured.  When KV IS configured the singletons
// are populated from KV on first access and written back on every mutation.

const _events = new Map<string, EventRow>();
const _bookings = new Map<string, BookingRow>();

// ─── KV type (subset of Cloudflare KVNamespace) ───────────────────────────────
export type KVStore = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  list(opts?: { prefix?: string; limit?: number }): Promise<{ keys: { name: string }[]; list_complete: boolean }>;
};

// ─── Extract KV from route-handler context (set by @cloudflare/vite-plugin) ──
export function extractKV(ctx: unknown): KVStore | null {
  const env = (ctx as any)?.cloudflare?.env ?? (ctx as any)?.env ?? {};
  const kv = env?.EVENTS_KV;
  if (kv && typeof kv.get === "function") return kv as KVStore;
  return null;
}

// ─── Key helpers ──────────────────────────────────────────────────────────────
const KEY_EVENTS_LIST = "events:v1:list";
const keyEvent = (id: string) => `events:v1:item:${id}`;
const keyBooking = (id: string) => `bookings:v1:item:${id}`;
const KEY_BOOKINGS_LIST = "bookings:v1:list";

// ─── Events ──────────────────────────────────────────────────────────────────

export async function listPublishedEvents(kv: KVStore | null): Promise<EventRow[]> {
  if (kv) {
    try {
      const raw = await kv.get(KEY_EVENTS_LIST);
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        const rows = await Promise.all(ids.map(id => getEventById(id, kv)));
        return rows.filter((e): e is EventRow => e !== null && e.is_published);
      }
    } catch {}
  }
  return [..._events.values()].filter(e => e.is_published)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function listAllEvents(kv: KVStore | null): Promise<EventRow[]> {
  if (kv) {
    try {
      const raw = await kv.get(KEY_EVENTS_LIST);
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        const rows = await Promise.all(ids.map(id => getEventById(id, kv)));
        return rows.filter((e): e is EventRow => e !== null)
          .sort((a, b) => b.created_at.localeCompare(a.created_at));
      }
    } catch {}
  }
  return [..._events.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getEventById(id: string, kv: KVStore | null): Promise<EventRow | null> {
  if (kv) {
    try {
      const raw = await kv.get(keyEvent(id));
      if (raw) {
        const e = JSON.parse(raw) as EventRow;
        _events.set(id, e);
        return e;
      }
    } catch {}
  }
  return _events.get(id) ?? null;
}

export async function upsertEvent(event: EventRow, kv: KVStore | null): Promise<void> {
  _events.set(event.id, event);
  if (kv) {
    try {
      await kv.put(keyEvent(event.id), JSON.stringify(event));
      const listRaw = await kv.get(KEY_EVENTS_LIST);
      const ids: string[] = listRaw ? JSON.parse(listRaw) : [];
      if (!ids.includes(event.id)) ids.unshift(event.id);
      await kv.put(KEY_EVENTS_LIST, JSON.stringify(ids));
    } catch {}
  }
}

export async function deleteEvent(id: string, kv: KVStore | null): Promise<void> {
  _events.delete(id);
  if (kv) {
    try {
      await kv.delete(keyEvent(id));
      const listRaw = await kv.get(KEY_EVENTS_LIST);
      const ids: string[] = listRaw ? JSON.parse(listRaw) : [];
      await kv.put(KEY_EVENTS_LIST, JSON.stringify(ids.filter(i => i !== id)));
    } catch {}
  }
}

export async function bulkSyncEvents(events: EventRow[], kv: KVStore | null): Promise<void> {
  for (const e of events) {
    _events.set(e.id, e);
  }
  if (kv) {
    try {
      const ids = events.map(e => e.id);
      await Promise.all(events.map(e => kv.put(keyEvent(e.id), JSON.stringify(e))));
      await kv.put(KEY_EVENTS_LIST, JSON.stringify(ids));
    } catch {}
  }
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function createBooking(booking: BookingRow, kv: KVStore | null): Promise<void> {
  _bookings.set(booking.id, booking);
  if (kv) {
    try {
      await kv.put(keyBooking(booking.id), JSON.stringify(booking));
      const listRaw = await kv.get(KEY_BOOKINGS_LIST);
      const ids: string[] = listRaw ? JSON.parse(listRaw) : [];
      ids.unshift(booking.id);
      await kv.put(KEY_BOOKINGS_LIST, JSON.stringify(ids));
    } catch {}
  }
}

export async function getBookingById(id: string, kv: KVStore | null): Promise<BookingRow | null> {
  if (kv) {
    try {
      const raw = await kv.get(keyBooking(id));
      if (raw) {
        const b = JSON.parse(raw) as BookingRow;
        _bookings.set(id, b);
        return b;
      }
    } catch {}
  }
  return _bookings.get(id) ?? null;
}

export async function updateBooking(
  id: string,
  patch: Partial<BookingRow>,
  kv: KVStore | null,
): Promise<BookingRow | null> {
  const existing = await getBookingById(id, kv);
  if (!existing) return null;
  const updated: BookingRow = { ...existing, ...patch };
  _bookings.set(id, updated);
  if (kv) {
    try {
      await kv.put(keyBooking(id), JSON.stringify(updated));
    } catch {}
  }
  return updated;
}

export async function listBookings(kv: KVStore | null): Promise<BookingRow[]> {
  if (kv) {
    try {
      const listRaw = await kv.get(KEY_BOOKINGS_LIST);
      if (listRaw) {
        const ids: string[] = JSON.parse(listRaw);
        const rows = await Promise.all(ids.map(id => getBookingById(id, kv)));
        return rows.filter((b): b is BookingRow => b !== null);
      }
    } catch {}
  }
  return [..._bookings.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// ─── M-Pesa checkout → booking lookup ─────────────────────────────────────────
const _checkoutToBooking = new Map<string, string>();

export async function setCheckoutBooking(checkoutId: string, bookingId: string, kv: KVStore | null) {
  _checkoutToBooking.set(checkoutId, bookingId);
  if (kv) {
    try {
      await kv.put(`mpesa:checkout:${checkoutId}`, bookingId, { expirationTtl: 3600 });
    } catch {}
  }
}

export async function getBookingByCheckout(checkoutId: string, kv: KVStore | null): Promise<string | null> {
  if (kv) {
    try {
      const id = await kv.get(`mpesa:checkout:${checkoutId}`);
      if (id) return id;
    } catch {}
  }
  return _checkoutToBooking.get(checkoutId) ?? null;
}
