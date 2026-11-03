import { useState } from "react";
import { Play, Video } from "lucide-react";

// Public YouTube videos about the stadium, embedded with YouTube's own player (credit stays with the channel).
const VIDEOS = [
  { id: "19ldDrzYHac", title: "Talanta Stadium (Raila Odinga) — aerial view", channel: "AMALI MEDIA" },
  { id: "9kR_tgXpp4A", title: "Raila Odinga International Stadium (Talanta Sports City)", channel: "TV47 Kenya" },
  { id: "DHie_rBu1AE", title: "Talanta Stadium looks amazing at night", channel: "Dennis THE NATIONAL" },
  { id: "ERpLQ2-XM4E", title: "Inside Talanta Stadium City", channel: "MASH EMPIRE" },
  { id: "6XZMqvT1wgA", title: "Talanta Stadium renamed Raila Odinga International Stadium", channel: "KBC Channel 1" },
];

export function TalantaVideos({ heading = "See Talanta Stadium" }: { heading?: string }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const current = VIDEOS[active];

  return (
    <section aria-labelledby="videos-title">
      <div className="flex items-center gap-2">
        <Video className="h-5 w-5 text-accent" />
        <h2 id="videos-title" className="font-display text-2xl font-bold sm:text-3xl">{heading}</h2>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-primary/30 bg-black shadow-glow">
        <div className="relative aspect-video w-full">
          {playing ? (
            <iframe
              key={current.id}
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${current.id}?autoplay=1&rel=0&modestbranding=1`}
              title={current.title}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 h-full w-full" aria-label={`Play: ${current.title}`}>
              <img src={`https://i.ytimg.com/vi/${current.id}/hqdefault.jpg`} alt="" className="h-full w-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
              <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-ember shadow-ember transition group-hover:scale-110 sm:h-20 sm:w-20">
                <Play className="ml-1 h-7 w-7 fill-current text-primary-foreground sm:h-9 sm:w-9" />
              </span>
            </button>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
          <p className="line-clamp-1 text-sm font-semibold">{current.title}</p>
          <span className="shrink-0 text-[11px] text-muted-foreground">{current.channel}</span>
        </div>
      </div>

      <ul className="-mx-4 mt-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:scroll-px-0 sm:px-0">
        {VIDEOS.map((v, i) => (
          <li key={v.id} className="w-40 shrink-0 snap-start sm:w-48">
            <button
              type="button"
              onClick={() => { setActive(i); setPlaying(false); }}
              className={`block w-full overflow-hidden rounded-xl border text-left transition ${i === active ? "border-gold shadow-gold" : "border-border/60 hover:border-primary/50"}`}
              aria-label={`Select: ${v.title}`}
            >
              <img src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`} alt="" className="aspect-video w-full bg-secondary object-cover" />
              <span className="block line-clamp-2 px-2 py-1.5 text-[11px] font-semibold leading-tight">{v.title}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-muted-foreground">Videos are played from YouTube and belong to their channels.</p>
    </section>
  );
}
