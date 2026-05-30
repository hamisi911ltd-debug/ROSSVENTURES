import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { X, ZoomIn, ImageIcon, Camera } from "lucide-react";
import type { GalleryPhoto } from "@/lib/types";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Ross Ventures Limited" },
      { name: "description", content: "Photos from events and productions by Ross Ventures Limited across Kenya." },
      { property: "og:title", content: "Gallery — Ross Ventures Limited" },
    ],
  }),
  component: GalleryPage,
});

const GALLERY_STORAGE_KEY = "rossventures-gallery";

function getLocalGallery(): GalleryPhoto[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GALLERY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((p: any) => p.is_published) : [];
  } catch {
    return [];
  }
}

function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    const local = getLocalGallery();
    if (local.length > 0) setPhotos(local);

    fetch("/admin-gallery", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { ok: boolean; photos: GalleryPhoto[] }) => {
        if (data.ok && Array.isArray(data.photos) && data.photos.length > 0) {
          const published = data.photos.filter((p) => p.is_published);
          setPhotos(published);
          window.localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(published));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    setLoading(false);
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeLightbox(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, closeLightbox]);

  const eventNames = ["All", ...Array.from(new Set(photos.map((p) => p.event_name).filter(Boolean)))];
  const filtered = activeFilter === "All" ? photos : photos.filter((p) => p.event_name === activeFilter);

  return (
    <main className="mx-auto max-w-6xl px-4 py-14">
      {/* Header */}
      <header className="mb-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
          <Camera className="h-3.5 w-3.5" /> Event Gallery
        </span>
        <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
          Captured <span className="text-gradient-ember">moments</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          Behind-the-scenes and on-stage shots from our events and productions across Kenya.
        </p>
      </header>

      {/* Filter tabs */}
      {eventNames.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          {eventNames.map((name) => (
            <button
              key={name}
              onClick={() => setActiveFilter(name)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                activeFilter === name
                  ? "border-accent bg-accent/20 text-accent"
                  : "border-border/60 text-muted-foreground hover:border-accent/40 hover:text-foreground"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* Gallery grid */}
      {loading ? (
        <div className="grid place-items-center py-24 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="grid place-items-center gap-4 rounded-2xl border border-dashed border-border py-24 text-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No photos yet — check back soon!</p>
        </div>
      ) : (
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
          {filtered.map((photo) => (
            <div
              key={photo.id}
              className="group mb-3 cursor-pointer overflow-hidden rounded-xl break-inside-avoid"
              onClick={() => setLightbox(photo)}
            >
              <div className="relative">
                <img
                  src={photo.url}
                  alt={photo.caption || photo.event_name || "Gallery photo"}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {photo.event_name && (
                    <span className="inline-block rounded-full bg-accent/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                      {photo.event_name}
                    </span>
                  )}
                  {photo.caption && (
                    <p className="mt-1 text-xs font-medium text-white line-clamp-2">{photo.caption}</p>
                  )}
                </div>
                <div className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-sm">
                  <ZoomIn className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative max-h-[90vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.url}
              alt={lightbox.caption || lightbox.event_name || "Gallery photo"}
              className="max-h-[80vh] w-auto rounded-xl object-contain shadow-2xl"
            />
            {(lightbox.event_name || lightbox.caption) && (
              <div className="mt-3 text-center">
                {lightbox.event_name && (
                  <span className="rounded-full bg-accent/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    {lightbox.event_name}
                  </span>
                )}
                {lightbox.caption && (
                  <p className="mt-2 text-sm text-white/80">{lightbox.caption}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
