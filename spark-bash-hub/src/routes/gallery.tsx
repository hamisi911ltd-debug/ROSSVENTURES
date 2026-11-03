import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { X, ZoomIn, ChevronLeft, ChevronRight, Camera } from "lucide-react";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Football Arena254" },
      { name: "description", content: "Photos of Talanta Stadium and Kenyan football matchdays." },
      { property: "og:title", content: "Gallery — Football Arena254" },
    ],
  }),
  component: GalleryPage,
});

// Static photos from public/gallery — Talanta Stadium first
const STATIC_PHOTOS: Array<{ id: string; url: string; caption?: string }> = [
  { id: "s01", url: "/gallery/talanta-stadium.jpg",          caption: "Talanta Stadium, Nairobi" },
  { id: "s02", url: "/gallery/talanta-shield.jpg",           caption: "Talanta Stadium — the shield façade" },
  { id: "s03", url: "/gallery/talanta-aerial.jpg",           caption: "Talanta Stadium from above" },
  { id: "s04", url: "/gallery/talanta-roof.jpg",             caption: "Talanta Stadium — roof and bowl" },
  { id: "s05", url: "/gallery/match-kasarani-inside.jpg",    caption: "League matchday at Kasarani" },
  { id: "s06", url: "/gallery/match-action-green-yellow.jpg", caption: "League action" },
  { id: "s07", url: "/gallery/match-action-league.jpg",      caption: "Premier League clash" },
  { id: "s08", url: "/gallery/fans-kasarani.jpg",            caption: "Fans heading into Kasarani" },
];

type PhotoItem = { id: string; url: string; caption?: string; event_name?: string };

function GalleryPage() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Merge: static photos first, then any admin-only ones
  const allPhotos: PhotoItem[] = STATIC_PHOTOS;

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);

  const prev = useCallback(() => {
    setLightboxIdx((i) => (i === null ? null : (i - 1 + allPhotos.length) % allPhotos.length));
  }, [allPhotos.length]);

  const next = useCallback(() => {
    setLightboxIdx((i) => (i === null ? null : (i + 1) % allPhotos.length));
  }, [allPhotos.length]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, closeLightbox, prev, next]);

  const activeLightboxPhoto = lightboxIdx !== null ? allPhotos[lightboxIdx] : null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-14">
      {/* Header */}
      <header className="mb-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
          <Camera className="h-3.5 w-3.5" /> Stadium Gallery
        </span>
        <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
          Talanta &amp; <span className="text-gradient-ember">matchday</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          The new Talanta Stadium and the atmosphere of Kenyan football — photos via Wikimedia Commons.
        </p>
      </header>

      <p className="mb-6 text-center text-xs text-muted-foreground">
        Credits: Talanta Stadium photo by Raymond Omollo (CC0). Match photos by Sila Kiplagat, Endesia94 and Eriksson1904 (CC BY-SA 4.0), Wikimedia Commons.
      </p>

      {/* Gallery grid — uniform square tiles, object-cover so images fill with no borders */}
      {allPhotos.length === 0 ? (
        <div className="grid place-items-center gap-4 rounded-2xl border border-dashed border-border py-24 text-center">
          <Camera className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No photos yet — check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {allPhotos.map((photo, idx) => (
            <button
              key={photo.id}
              type="button"
              className="group relative aspect-square overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => setLightboxIdx(idx)}
              aria-label={photo.caption ?? "View photo"}
            >
              <img
                src={photo.url}
                alt={photo.caption ?? "Gallery photo"}
                loading="lazy"
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="rounded-full bg-black/40 p-2 backdrop-blur-sm">
                  <ZoomIn className="h-5 w-5 text-white" />
                </span>
              </div>
              {photo.event_name && (
                <span className="absolute bottom-2 left-2 right-2 truncate rounded-full bg-accent/90 px-2 py-0.5 text-center text-[10px] font-bold uppercase tracking-wider text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {photo.event_name}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {activeLightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-16 top-1/2 z-10 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Image */}
          <div
            className="relative max-h-[90vh] max-w-5xl w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeLightboxPhoto.url}
              alt={activeLightboxPhoto.caption ?? "Gallery photo"}
              className="max-h-[82vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
            {(activeLightboxPhoto.event_name || activeLightboxPhoto.caption) && (
              <div className="absolute bottom-0 left-0 right-0 rounded-b-xl bg-gradient-to-t from-black/80 p-4 text-center">
                {activeLightboxPhoto.event_name && (
                  <span className="rounded-full bg-accent/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    {activeLightboxPhoto.event_name}
                  </span>
                )}
                {activeLightboxPhoto.caption && (
                  <p className="mt-2 text-sm text-white/80">{activeLightboxPhoto.caption}</p>
                )}
              </div>
            )}
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 backdrop-blur-sm">
            {(lightboxIdx ?? 0) + 1} / {allPhotos.length}
          </div>
        </div>
      )}
    </main>
  );
}
