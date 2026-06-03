import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  Loader2, Upload, Trash2, LogOut, Eye, EyeOff, ImageIcon,
  Search, RefreshCw, Ticket, TrendingUp, CalendarDays, DollarSign,
  Camera, Link as LinkIcon, X,
} from "lucide-react";
import type { GalleryPhoto } from "@/lib/types";
import type { EventRow, BookingRow, TicketTier } from "@/lib/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Manage Events · Ross Ventures" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const AUTH_KEY = "rossventures-admin-auth";
const STORAGE_KEY = "rossventures-admin-events";
const GALLERY_STORAGE_KEY = "rossventures-gallery";

function loadStoredGallery(): GalleryPhoto[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GALLERY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveStoredGallery(photos: GalleryPhoto[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(photos));
}

async function syncGalleryToServer(photos: GalleryPhoto[]): Promise<boolean> {
  try {
    const res = await fetch("/admin-gallery", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ photos }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

const eventSchema = z.object({
  title: z.string().trim().min(2).max(120),
  venue: z.string().trim().max(160).optional().or(z.literal("")),
  event_date: z.string().max(60).optional().or(z.literal("")),
  tag: z.string().trim().max(40).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

function migrateEvent(raw: any): EventRow {
  // Support old format that had ticket_price string instead of tiers array
  const tiers: EventRow["tiers"] = Array.isArray(raw.tiers) && raw.tiers.length > 0
    ? raw.tiers.map((t: any) => ({
        name: String(t.name ?? "General"),
        price: Number(t.price ?? 0),
        description: String(t.description ?? ""),
      }))
    : raw.ticket_price
      ? [{ name: "General", price: parseInt(String(raw.ticket_price).replace(/\D/g, "")) || 0, description: "Standard entry" }]
      : [{ name: "General", price: 0, description: "Standard entry" }];

  return {
    id: String(raw.id ?? crypto.randomUUID()),
    title: String(raw.title ?? "Untitled"),
    description: String(raw.description ?? ""),
    venue: String(raw.venue ?? ""),
    event_date: String(raw.event_date ?? ""),
    tag: String(raw.tag ?? ""),
    is_published: Boolean(raw.is_published),
    created_at: String(raw.created_at ?? new Date().toISOString()),
    poster_url: raw.poster_url ?? null,
    tiers,
  };
}

function loadStoredEvents(): EventRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const migrated = parsed.map(migrateEvent);
    // Re-save in new format so future loads are clean
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch { return []; }
}

function saveStoredEvents(events: EventRow[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Failed to read image"));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function syncEventsToServer(events: EventRow[]): Promise<boolean> {
  try {
    const res = await fetch("/admin-events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ events }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function fetchBookings(): Promise<BookingRow[]> {
  // Bookings are stored in localStorage on each user's device.
  // The admin can see bookings that were made on this same device.
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("rossventures-bookings");
    if (!raw) return [];
    return JSON.parse(raw) as BookingRow[];
  } catch { return []; }
}

function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"events" | "bookings" | "gallery">("events");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncOk, setSyncOk] = useState<boolean | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [tiers, setTiers] = useState<TicketTier[]>([
    { name: "Early Bird", price: 450, description: "Limited slots" },
    { name: "Advance", price: 600, description: "Standard entry" },
    { name: "Gate", price: 800, description: "Day-of pricing" },
    { name: "VVIP", price: 2000, description: "Premium experience" },
  ]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Gallery state
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [galleryUrl, setGalleryUrl] = useState("");
  const [galleryCaption, setGalleryCaption] = useState("");
  const [galleryEventName, setGalleryEventName] = useState("");
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryPreview, setGalleryPreview] = useState<string | null>(null);
  const [gallerySubmitting, setGallerySubmitting] = useState(false);
  const [gallerySyncOk, setGallerySyncOk] = useState<boolean | null>(null);

  const publishedCount = useMemo(() => events.filter(e => e.is_published).length, [events]);
  const totalRevenue = useMemo(
    () => bookings.filter(b => b.status === "paid").reduce((s, b) => s + b.amount, 0),
    [bookings],
  );
  const paidBookings = useMemo(() => bookings.filter(b => b.status === "paid").length, [bookings]);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return events;
    return events.filter(e =>
      e.title.toLowerCase().includes(q) || (e.venue ?? "").toLowerCase().includes(q),
    );
  }, [events, searchQuery]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const authorized = window.sessionStorage.getItem(AUTH_KEY) === "true";
    if (!authorized) { navigate({ to: "/auth" }); return; }

    // Show local events immediately while server fetch is in flight
    const stored = loadStoredEvents();
    setEvents(stored);
    setCheckedAuth(true);
    setLoading(false);

    // Fetch gallery from server
    const storedGallery = loadStoredGallery();
    setGallery(storedGallery);
    fetch("/admin-gallery", { cache: "no-store" })
      .then(r => r.json())
      .then((data: { ok: boolean; photos: GalleryPhoto[] }) => {
        if (data.ok && Array.isArray(data.photos) && data.photos.length > 0) {
          setGallery(data.photos);
          saveStoredGallery(data.photos);
        }
      })
      .catch(() => {});

    fetchBookings().then(setBookings);

    // Pull events from server (KV) — server is source of truth for cross-device sync
    async function pullFromServer() {
      try {
        const res = await fetch("/admin-events", { cache: "no-store" });
        const data: { ok: boolean; events: EventRow[] } = await res.json();
        if (data.ok && Array.isArray(data.events)) {
          // Merge: keep any local-only drafts not yet on server
          const serverIds = new Set(data.events.map(e => e.id));
          const localDrafts = loadStoredEvents().filter(e => !serverIds.has(e.id));
          const merged = [...data.events, ...localDrafts];
          setEvents(merged);
          saveStoredEvents(merged);
          // Push local drafts up to server if any
          if (localDrafts.length > 0) syncEventsToServer(merged);
        }
      } catch {}
    }

    pullFromServer();

    // Auto-sync every 30 seconds so changes from any device appear automatically
    const interval = setInterval(pullFromServer, 30_000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function onPickFile(f: File | null) {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  function updateTier(idx: number, field: keyof TicketTier, value: string | number) {
    setTiers(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  }

  function onPickGalleryFile(f: File | null) {
    setGalleryFile(f);
    if (galleryPreview) URL.revokeObjectURL(galleryPreview);
    setGalleryPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleAddPhoto(e: React.FormEvent) {
    e.preventDefault();
    const hasFile = !!galleryFile;
    const hasUrl = galleryUrl.trim().length > 0;
    if (!hasFile && !hasUrl) { toast.error("Provide an image file or URL"); return; }
    setGallerySubmitting(true);
    try {
      let finalUrl = galleryUrl.trim();
      if (hasFile) {
        if (galleryFile!.size > 5 * 1024 * 1024) throw new Error("Image must be under 5 MB");
        finalUrl = await readFileAsDataUrl(galleryFile!);
      }
      const newPhoto: GalleryPhoto = {
        id: crypto.randomUUID(),
        url: finalUrl,
        caption: galleryCaption.trim(),
        event_name: galleryEventName.trim(),
        is_published: true,
        created_at: new Date().toISOString(),
      };
      const next = [newPhoto, ...gallery];
      saveStoredGallery(next);
      setGallery(next);
      const ok = await syncGalleryToServer(next);
      setGallerySyncOk(ok);
      toast.success(ok ? "Photo published & synced ✓" : "Photo saved locally (tap Sync)");
      setGalleryUrl(""); setGalleryCaption(""); setGalleryEventName("");
      onPickGalleryFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add photo");
    } finally { setGallerySubmitting(false); }
  }

  async function handleSyncGallery() {
    const ok = await syncGalleryToServer(gallery);
    setGallerySyncOk(ok);
    toast[ok ? "success" : "error"](ok ? "Gallery synced to all devices ✓" : "Sync failed");
  }

  async function togglePhotoPublish(photo: GalleryPhoto) {
    const next = gallery.map(p => p.id === photo.id ? { ...p, is_published: !p.is_published } : p);
    setGallery(next);
    saveStoredGallery(next);
    const ok = await syncGalleryToServer(next);
    setGallerySyncOk(ok);
  }

  async function deletePhoto(photo: GalleryPhoto) {
    if (!confirm(`Delete this photo?`)) return;
    const next = gallery.filter(p => p.id !== photo.id);
    setGallery(next);
    saveStoredGallery(next);
    const ok = await syncGalleryToServer(next);
    setGallerySyncOk(ok);
    toast.success("Photo deleted");
  }

  async function handleSync() {
    setSyncing(true);
    const ok = await syncEventsToServer(events);
    setSyncOk(ok);
    const fresh = await fetchBookings();
    setBookings(fresh);
    toast[ok ? "success" : "error"](ok ? "Events synced to all devices ✓" : "Sync failed — check connection");
    setSyncing(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = eventSchema.safeParse({ title, venue, event_date: eventDate, tag, description });
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid input"); return; }

    setSubmitting(true);
    try {
      let posterUrl: string | null = null;
      if (file) {
        if (file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5 MB");
        posterUrl = await readFileAsDataUrl(file);
      }

      const newEvent: EventRow = {
        id: crypto.randomUUID(),
        title: parsed.data.title,
        venue: parsed.data.venue || "",
        event_date: parsed.data.event_date || "",
        tag: parsed.data.tag || "",
        description: parsed.data.description || "",
        tiers: tiers.map(t => ({ ...t, price: Number(t.price) })),
        poster_url: posterUrl,
        is_published: true,
        created_at: new Date().toISOString(),
      };

      const next = [newEvent, ...events];
      saveStoredEvents(next);
      setEvents(next);
      const ok = await syncEventsToServer(next);
      setSyncOk(ok);
      toast.success(ok ? "Event published & synced to all devices ✓" : "Event saved locally (sync failed — tap Sync)");

      // Reset
      setTitle(""); setVenue(""); setEventDate(""); setTag(""); setDescription("");
      setTiers([
        { name: "Early Bird", price: 450, description: "Limited slots" },
        { name: "Advance", price: 600, description: "Standard entry" },
        { name: "Gate", price: 800, description: "Day-of pricing" },
        { name: "VVIP", price: 2000, description: "Premium experience" },
      ]);
      onPickFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add event");
    } finally { setSubmitting(false); }
  }

  const togglePublish = useCallback(async (ev: EventRow) => {
    const next = events.map(e => e.id === ev.id ? { ...e, is_published: !e.is_published } : e);
    setEvents(next);
    saveStoredEvents(next);
    const ok = await syncEventsToServer(next);
    setSyncOk(ok);
  }, [events]);

  const deleteEvent = useCallback(async (ev: EventRow) => {
    if (!confirm(`Delete "${ev.title}"?`)) return;
    const next = events.filter(e => e.id !== ev.id);
    setEvents(next);
    saveStoredEvents(next);
    const ok = await syncEventsToServer(next);
    setSyncOk(ok);
    toast.success("Deleted");
  }, [events]);

  const signOut = useCallback(() => {
    if (typeof window !== "undefined") window.sessionStorage.removeItem(AUTH_KEY);
    navigate({ to: "/auth" });
  }, [navigate]);

  if (!checkedAuth) return null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
            Admin dashboard
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Manage <span className="text-gradient-ember">events</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {syncOk === true && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Synced to all devices
            </span>
          )}
          {syncOk === false && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Local only — tap Sync
            </span>
          )}
          <button onClick={handleSync} disabled={syncing} className="inline-flex items-center gap-2 rounded-xl border border-border/80 px-4 py-2 text-sm font-semibold hover:bg-secondary disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} /> Sync to all devices
          </button>
          <button onClick={signOut} className="inline-flex items-center gap-2 rounded-xl border border-border/80 px-4 py-2 text-sm font-semibold hover:bg-secondary">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {[
          { icon: CalendarDays, label: "Total events", value: events.length, color: "text-foreground" },
          { icon: Eye, label: "Live events", value: publishedCount, color: "text-accent" },
          { icon: Ticket, label: "Bookings paid", value: paidBookings, color: "text-emerald-400" },
          { icon: DollarSign, label: "Revenue (KES)", value: `${totalRevenue.toLocaleString()}`, color: "text-amber-400" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-border/60 bg-card/60 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{s.label}</p>
            <p className={`mt-4 text-3xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-10 flex gap-1 rounded-xl border border-border/60 bg-card/40 p-1 w-fit">
        {(["events", "bookings", "gallery"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${tab === t ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "events" && (
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          {/* Add Event Form */}
          <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border/60 bg-card/60 p-6">
            <h2 className="font-display text-xl font-bold">Add new event</h2>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Poster image</span>
              <div className="mt-1.5 grid gap-3 sm:grid-cols-[100px_1fr]">
                <div className="relative grid aspect-[3/4] w-[100px] place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-background">
                  {preview ? <img src={preview} alt="Preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
                </div>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold hover:bg-secondary">
                  <Upload className="h-4 w-4" />
                  {file ? file.name.slice(0, 20) : "Choose poster (JPG/PNG, ≤5MB)"}
                  <input type="file" accept="image/*" className="hidden" onChange={e => onPickFile(e.target.files?.[0] ?? null)} />
                </label>
              </div>
            </label>

            <Field label="Title *" value={title} onChange={setTitle} required maxLength={120} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tag (e.g. 2026 · Headline)" value={tag} onChange={setTag} maxLength={40} />
              <Field label="Date / time" value={eventDate} onChange={setEventDate} placeholder="16 Sep 2026 · 2PM" maxLength={60} />
            </div>
            <Field label="Venue" value={venue} onChange={setVenue} placeholder="JKUAT, Juja" maxLength={160} />

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</span>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} maxLength={2000}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            </label>

            {/* Ticket Tiers */}
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ticket tiers</span>
              <div className="mt-2 space-y-2">
                {tiers.map((tier, i) => (
                  <div key={i} className="grid grid-cols-[1fr_90px_1fr] gap-2 items-center">
                    <input value={tier.name} onChange={e => updateTier(i, "name", e.target.value)} placeholder="Tier name" maxLength={30}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                    <input type="number" value={tier.price} onChange={e => updateTier(i, "price", Number(e.target.value))} placeholder="Price" min={0}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                    <input value={tier.description} onChange={e => updateTier(i, "description", e.target.value)} placeholder="Description" maxLength={50}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-ember px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-ember disabled:opacity-60">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Publish event
            </button>
          </form>

          {/* Events List */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input type="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search events"
                className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary" />
            </div>
            {loading ? (
              <div className="grid place-items-center py-10"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div>
            ) : filteredEvents.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                {events.length === 0 ? "No events yet. Use the form to add one." : "No matching events."}
              </p>
            ) : (
              <ul className="space-y-3">
                {filteredEvents.map(ev => (
                  <li key={ev.id} className="flex gap-4 rounded-xl border border-border/60 bg-card/60 p-3">
                    <div className="grid h-20 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-background">
                      {ev.poster_url ? <img src={ev.poster_url} alt="Poster" className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="truncate font-display text-sm font-bold">{ev.title}</h3>
                          <p className="truncate text-xs text-muted-foreground">{ev.venue}{ev.event_date ? ` · ${ev.event_date}` : ""}</p>
                          <p className="mt-0.5 text-xs text-accent">{(ev.tiers ?? []).map(t => `${t.name}: KES ${t.price}`).join(" · ")}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${ev.is_published ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}>
                          {ev.is_published ? "Live" : "Hidden"}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => togglePublish(ev)} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-semibold hover:bg-secondary">
                          {ev.is_published ? <><EyeOff className="h-3 w-3" /> Hide</> : <><Eye className="h-3 w-3" /> Publish</>}
                        </button>
                        <button onClick={() => deleteEvent(ev)} className="inline-flex items-center gap-1 rounded-md border border-destructive/40 px-2 py-1 text-[11px] font-semibold text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {tab === "gallery" && (
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          {/* Add Photo Form */}
          <form onSubmit={handleAddPhoto} className="space-y-4 rounded-2xl border border-border/60 bg-card/60 p-6 h-fit">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Add photo</h2>
              <div className="flex items-center gap-2">
                {gallerySyncOk === true && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Synced
                  </span>
                )}
                <button type="button" onClick={handleSyncGallery} className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 px-3 py-1.5 text-xs font-semibold hover:bg-secondary">
                  <RefreshCw className="h-3.5 w-3.5" /> Sync
                </button>
              </div>
            </div>

            {/* File or URL */}
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Photo (upload file or paste URL)</span>
              <div className="mt-2 space-y-2">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm font-semibold hover:bg-secondary">
                  <Camera className="h-4 w-4" />
                  {galleryFile ? galleryFile.name.slice(0, 24) : "Upload image (≤5 MB)"}
                  <input type="file" accept="image/*" className="hidden" onChange={e => onPickGalleryFile(e.target.files?.[0] ?? null)} />
                </label>
                {galleryPreview && (
                  <div className="relative overflow-hidden rounded-xl">
                    <img src={galleryPreview} alt="Preview" className="w-full max-h-40 object-cover" />
                    <button type="button" onClick={() => onPickGalleryFile(null)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border/60" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border/60" />
                </div>
                <label className="block">
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3">
                    <LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      type="url"
                      value={galleryUrl}
                      onChange={e => setGalleryUrl(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                    />
                  </div>
                </label>
              </div>
            </div>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Event name</span>
              <input type="text" value={galleryEventName} onChange={e => setGalleryEventName(e.target.value)}
                placeholder="e.g. Comrades Festival 1.0" maxLength={80}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Caption (optional)</span>
              <input type="text" value={galleryCaption} onChange={e => setGalleryCaption(e.target.value)}
                placeholder="Add a short caption…" maxLength={160}
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            </label>

            <button type="submit" disabled={gallerySubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-ember px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-ember disabled:opacity-60">
              {gallerySubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              Post to gallery
            </button>
          </form>

          {/* Gallery grid */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">
                {gallery.length} photo{gallery.length !== 1 ? "s" : ""}
              </h2>
            </div>
            {gallery.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No photos yet. Use the form to add your first one.
              </p>
            ) : (
              <div className="columns-2 gap-3 sm:columns-3">
                {gallery.map(photo => (
                  <div key={photo.id} className="mb-3 break-inside-avoid overflow-hidden rounded-xl border border-border/60 group relative">
                    <img src={photo.url} alt={photo.caption || photo.event_name || "Gallery"} loading="lazy"
                      className="w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-xl" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {photo.event_name && (
                        <span className="inline-block rounded-full bg-accent/80 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                          {photo.event_name}
                        </span>
                      )}
                      {photo.caption && (
                        <p className="mt-0.5 text-[11px] text-white/80 line-clamp-1">{photo.caption}</p>
                      )}
                      <div className="mt-1.5 flex gap-1.5">
                        <button onClick={() => togglePhotoPublish(photo)}
                          className="inline-flex items-center gap-1 rounded-md bg-white/20 px-2 py-1 text-[10px] font-semibold text-white hover:bg-white/30 backdrop-blur-sm">
                          {photo.is_published ? <><EyeOff className="h-3 w-3" /> Hide</> : <><Eye className="h-3 w-3" /> Show</>}
                        </button>
                        <button onClick={() => deletePhoto(photo)}
                          className="inline-flex items-center gap-1 rounded-md bg-red-500/60 px-2 py-1 text-[10px] font-semibold text-white hover:bg-red-500/80 backdrop-blur-sm">
                          <Trash2 className="h-3 w-3" /> Del
                        </button>
                      </div>
                    </div>
                    {!photo.is_published && (
                      <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">Hidden</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {tab === "bookings" && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">All bookings</h2>
            <button onClick={() => fetchBookings().then(setBookings)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
          {bookings.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="border-b border-border/60 bg-card/40">
                  <tr>
                    {["Name", "Event", "Ticket", "Qty", "Amount", "Status", "M-Pesa Receipt", "Date"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-card/40">
                      <td className="px-4 py-3 font-medium">{b.full_name}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">{b.event_title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{b.ticket_type}</td>
                      <td className="px-4 py-3">{b.quantity}</td>
                      <td className="px-4 py-3 font-medium">KES {b.amount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${b.status === "paid" ? "bg-emerald-500/20 text-emerald-400" : b.status === "pending" ? "bg-amber-500/20 text-amber-400" : "bg-destructive/20 text-destructive"}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{b.mpesa_receipt ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function Field({ label, value, onChange, placeholder, required, maxLength }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        required={required} maxLength={maxLength}
        className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
    </label>
  );
}
