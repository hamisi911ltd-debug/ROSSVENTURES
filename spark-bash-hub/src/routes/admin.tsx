import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, Upload, Trash2, LogOut, Eye, EyeOff, ImageIcon, Search } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Manage Events · Ross Ventures" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  venue: string | null;
  event_date: string | null;
  poster_url: string | null;
  ticket_price: string | null;
  tag: string | null;
  is_published: boolean;
  created_at: string;
};

const eventSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120),
  venue: z.string().trim().max(160).optional().or(z.literal("")),
  event_date: z.string().max(40).optional().or(z.literal("")),
  ticket_price: z.string().trim().max(80).optional().or(z.literal("")),
  tag: z.string().trim().max(40).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

function AdminPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(false);

  // form
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const publishedCount = useMemo(() => events.filter((ev) => ev.is_published).length, [events]);
  const hiddenCount = useMemo(() => events.length - publishedCount, [events, publishedCount]);
  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return events;
    return events.filter((ev) =>
      ev.title.toLowerCase().includes(query)
      || (ev.venue ?? "").toLowerCase().includes(query)
      || (ev.tag ?? "").toLowerCase().includes(query)
      || (ev.ticket_price ?? "").toLowerCase().includes(query)
      || (ev.description ?? "").toLowerCase().includes(query)
    );
  }, [events, searchQuery]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setEvents((data ?? []) as EventRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  function onPickFile(f: File | null) {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = eventSchema.safeParse({
      title, venue, event_date: eventDate, ticket_price: ticketPrice, tag, description,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    try {
      let posterUrl: string | null = null;
      if (file) {
        if (file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5 MB");
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("event-posters")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("event-posters").getPublicUrl(path);
        posterUrl = pub.publicUrl;
      }
      const { error } = await supabase.from("events").insert({
        title: parsed.data.title,
        venue: parsed.data.venue || null,
        event_date: parsed.data.event_date || null,
        ticket_price: parsed.data.ticket_price || null,
        tag: parsed.data.tag || null,
        description: parsed.data.description || null,
        poster_url: posterUrl,
        is_published: true,
      });
      if (error) throw error;
      toast.success("Event added");
      setTitle(""); setVenue(""); setEventDate(""); setTicketPrice("");
      setTag(""); setDescription(""); onPickFile(null);
      loadEvents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add event");
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePublish(ev: EventRow) {
    const { error } = await supabase
      .from("events")
      .update({ is_published: !ev.is_published })
      .eq("id", ev.id);
    if (error) toast.error(error.message);
    else loadEvents();
  }

  async function deleteEvent(ev: EventRow) {
    if (!confirm(`Delete "${ev.title}"?`)) return;
    const { error } = await supabase.from("events").delete().eq("id", ev.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      loadEvents();
    }
  }

  function signOut() {
    navigate({ to: "/auth" });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
            Admin dashboard
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Manage <span className="text-gradient-ember">events</span></h1>
          <p className="mt-1 text-sm text-muted-foreground">Upload posters and publish new Ross Ventures events.</p>
        </div>
        <button onClick={signOut} className="inline-flex items-center gap-2 rounded-xl border border-border/80 px-4 py-2 text-sm font-semibold hover:bg-secondary">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Total events</p>
          <p className="mt-4 text-3xl font-semibold">{events.length}</p>
          <p className="mt-2 text-sm text-muted-foreground">Total events in the system</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Live</p>
          <p className="mt-4 text-3xl font-semibold text-accent">{publishedCount}</p>
          <p className="mt-2 text-sm text-muted-foreground">Published events visible on the site</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Hidden</p>
          <p className="mt-4 text-3xl font-semibold text-muted-foreground">{hiddenCount}</p>
          <p className="mt-2 text-sm text-muted-foreground">Draft or archived events</p>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        {/* FORM */}
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border/60 bg-card/60 p-6">
          <h2 className="font-display text-xl font-bold">Add new event</h2>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Poster image</span>
            <div className="mt-1.5 grid gap-3 sm:grid-cols-[120px_1fr]">
              <div className="relative grid aspect-[3/4] w-[120px] place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-background">
                {preview ? (
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold hover:bg-secondary">
                <Upload className="h-4 w-4" />
                {file ? file.name.slice(0, 24) : "Choose poster (JPG/PNG, ≤5MB)"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </label>

          <Field label="Title" value={title} onChange={setTitle} required maxLength={120} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tag (e.g. 2026 · Headline)" value={tag} onChange={setTag} maxLength={40} />
            <Field label="Date / time" value={eventDate} onChange={setEventDate} placeholder="16 Sep 2026 · 2PM" maxLength={40} />
          </div>
          <Field label="Venue" value={venue} onChange={setVenue} placeholder="JKUAT, Juja" maxLength={160} />
          <Field label="Ticket price" value={ticketPrice} onChange={setTicketPrice} placeholder="Early Bird KES 450" maxLength={80} />
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={2000}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-ember px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-ember disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Publish event
          </button>
        </form>

        {/* LIST */}
        <section>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold">All events</h2>
              <p className="text-sm text-muted-foreground">Manage event visibility, delete outdated entries, or search by title, venue, tag, or description.</p>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events"
                className="w-full min-w-[180px] rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>{filteredEvents.length} matching</span>
            <span>{events.length} total</span>
          </div>
          {loading ? (
            <div className="mt-6 grid place-items-center py-10"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div>
          ) : filteredEvents.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              {events.length === 0 ? "No events yet. Use the form to add the first one." : "No matching events. Try a different search term or add a new event."}
            </p>
          ) : (
            <ul className="mt-6 space-y-3">
              {filteredEvents.map((ev) => (
                <li key={ev.id} className="flex gap-4 rounded-xl border border-border/60 bg-card/60 p-3">
                  <div className="grid h-20 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-background">
                    {ev.poster_url ? (
                      <img src={ev.poster_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-sm font-bold">{ev.title}</h3>
                        <p className="truncate text-xs text-muted-foreground">{ev.venue}{ev.event_date ? ` · ${ev.event_date}` : ""}</p>
                        {ev.ticket_price && <p className="mt-0.5 text-xs text-accent">{ev.ticket_price}</p>}
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
    </main>
  );
}

function Field({
  label, value, onChange, placeholder, required, maxLength,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
