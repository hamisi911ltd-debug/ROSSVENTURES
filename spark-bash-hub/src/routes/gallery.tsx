import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { X, ZoomIn, ChevronLeft, ChevronRight, Camera } from "lucide-react";
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

// Static photos from the local gallery folder (public/gallery/)
const STATIC_PHOTOS: Array<{ id: string; url: string; caption?: string }> = [
  { id: "s01", url: "/gallery/CPS_6969.JPG",   caption: "Event moments" },
  { id: "s02", url: "/gallery/CPS_7066.JPG",   caption: "Event moments" },
  { id: "s03", url: "/gallery/CPS_7140.JPG",   caption: "Event moments" },
  { id: "s04", url: "/gallery/CPS_7152.JPG",   caption: "Event moments" },
  { id: "s05", url: "/gallery/CPS_7157.JPG",   caption: "Event moments" },
  { id: "s06", url: "/gallery/CPS_7176.JPG",   caption: "Event moments" },
  { id: "s07", url: "/gallery/0d152c6a-b9be-4564-a251-c30a4373ecde.jfif" },
  { id: "s08", url: "/gallery/106a6018-1b4f-4011-b1a9-662051b96d8a.jfif" },
  { id: "s09", url: "/gallery/46238536-eb7f-4a00-909d-10c07f76fd30.jfif" },
  { id: "s10", url: "/gallery/69cd27d7-1484-4a4e-b5fd-4ccc11a2f1e2.jfif" },
  { id: "s11", url: "/gallery/69cd27d7-1484-4a4e-b5fd-4ccc11a2f1e2-dupe.jfif" },
  { id: "s12", url: "/gallery/7c7e8c54-452f-476e-a49f-134b43506fdd.jfif" },
  { id: "s13", url: "/gallery/a3f7b033-8e48-4ee6-87fc-af1f4ee750de.jfif" },
  { id: "s14", url: "/gallery/a4055781-d521-403f-a83c-16f519d2a3d5.jfif" },
  { id: "s15", url: "/gallery/b1df3aa6-9554-4a75-8289-17b2d7e51102.jfif" },
  { id: "s16", url: "/gallery/b6aef1b1-2128-41a2-a430-83bcf3dd91b3.jfif" },
  { id: "s17", url: "/gallery/b7b953e4-aac4-4a89-a464-f6e944fef889.jfif" },
  { id: "s18", url: "/gallery/d8fb1ff1-6921-4269-9d33-7d1e2a6802f0.jfif" },
  { id: "s19", url: "/gallery/dfc52382-5736-4bec-8315-b386ac355346.jfif" },
];

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

type PhotoItem = { id: string; url: string; caption?: string; event_name?: string };

function GalleryPage() {
  const [adminPhotos, setAdminPhotos] = useState<GalleryPhoto[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    const local = getLocalGallery();
    if (local.length > 0) setAdminPhotos(local);

    fetch("/admin-gallery", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { ok: boolean; photos: GalleryPhoto[] }) => {
        if (data.ok && Array.isArray(data.photos) && data.photos.length > 0) {
          const published = data.photos.filter((p) => p.is_published);
          setAdminPhotos(published);
          window.localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(published));
        }
      })
      .catch(() => {});
  }, []);

  // Merge: static photos first, then any admin-only ones
  const staticIds = new Set(STATIC_PHOTOS.map((p) => p.id));
  const adminExtra: PhotoItem[] = adminPhotos
    .filter((p) => !staticIds.has(p.id))
    .map((p) => ({ id: p.id, url: p.url, caption: p.caption, event_name: p.event_name }));

  const allPhotos: PhotoItem[] = [...STATIC_PHOTOS, ...adminExtra];

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
          <Camera className="h-3.5 w-3.5" /> Event Gallery
        </span>
        <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
          Captured <span className="text-gradient-ember">moments</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          Behind-the-scenes and on-stage shots from our events and productions across Kenya.
        </p>
      </header>

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
