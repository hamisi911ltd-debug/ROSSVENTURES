import { createFileRoute } from "@tanstack/react-router";
import credits from "@/lib/media-credits.json";

export const Route = createFileRoute("/credits")({
  head: () => ({
    meta: [
      { title: "Photo credits — Football Arena254" },
      { name: "description", content: "Credits and licences for the photos and logos used on Football Arena254." },
    ],
  }),
  component: CreditsPage,
});

type Item = { license?: string; artist?: string; page?: string; file?: string; title?: string };

const STATIC_CREDITS: { what: string; who: string; license: string; href: string }[] = [
  { what: "Talanta Stadium (aerial view)", who: "Raymond Omollo", license: "CC0", href: "https://commons.wikimedia.org/wiki/File:Raila_Odinga_International_Stadium.webp" },
  { what: "Matchday photo, Kasarani", who: "Endesia94", license: "CC BY-SA 4.0", href: "https://commons.wikimedia.org/wiki/File:Inside_the_Kasarani_Stadium.jpg" },
  { what: "Fans at Kasarani", who: "Eriksson1904", license: "CC BY-SA 4.0", href: "https://commons.wikimedia.org/wiki/File:A_few_minutes_before_the_match,_Kasarani,_Nairobi.jpg" },
  { what: "League match action", who: "Sila Kiplagat", license: "CC BY-SA 4.0", href: "https://commons.wikimedia.org/wiki/File:DN_GOR_STIMA_2002_fde.jpg" },
  { what: "League match action", who: "Sila Kiplagat", license: "CC BY-SA 4.0", href: "https://commons.wikimedia.org/wiki/File:Dn_sports_kpl_2701_ows.jpg" },
];

function Row({ name, item }: { name: string; item: Item }) {
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border/40 py-2 text-sm">
      <span className="font-medium">{name}</span>
      <span className="text-xs text-muted-foreground">
        {item.artist ?? "Unknown"} · {item.license}
        {item.page && (
          <>
            {" · "}
            <a href={item.page} target="_blank" rel="noreferrer" className="underline hover:text-foreground">source</a>
          </>
        )}
      </span>
    </li>
  );
}

function CreditsPage() {
  const players = Object.entries(credits.players as Record<string, Item>).filter(([, v]) => v.file);
  const clubs = Object.entries(credits.clubs as Record<string, Item>).filter(([, v]) => v.file);

  return (
    <main className="mx-auto max-w-3xl px-4 py-14 sm:py-20">
      <h1 className="font-display text-4xl font-bold">Photo credits</h1>
      <p className="mt-3 text-muted-foreground">
        Football Arena254 uses freely licensed images from Wikimedia Commons. Each image remains the work of its author and is used under
        the licence shown. Club names and badges belong to their clubs and are shown only to identify the matches on sale.
      </p>

      <h2 className="mt-10 font-display text-2xl font-bold">Stadium and matchday photos</h2>
      <ul className="mt-3">
        {STATIC_CREDITS.map((c) => (
          <li key={c.href} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border/40 py-2 text-sm">
            <span className="font-medium">{c.what}</span>
            <span className="text-xs text-muted-foreground">
              {c.who} · {c.license} ·{" "}
              <a href={c.href} target="_blank" rel="noreferrer" className="underline hover:text-foreground">source</a>
            </span>
          </li>
        ))}
      </ul>

      {players.length > 0 && (
        <>
          <h2 className="mt-10 font-display text-2xl font-bold">Player photos</h2>
          <ul className="mt-3">{players.map(([n, v]) => <Row key={n} name={n} item={v} />)}</ul>
        </>
      )}

      {clubs.length > 0 && (
        <>
          <h2 className="mt-10 font-display text-2xl font-bold">Club badges</h2>
          <ul className="mt-3">{clubs.map(([n, v]) => <Row key={n} name={n} item={v} />)}</ul>
        </>
      )}

      <h2 className="mt-10 font-display text-2xl font-bold">Videos</h2>
      <p className="mt-3 text-sm text-muted-foreground">Videos are streamed from YouTube with YouTube&apos;s own player and belong to their channels.</p>
    </main>
  );
}
