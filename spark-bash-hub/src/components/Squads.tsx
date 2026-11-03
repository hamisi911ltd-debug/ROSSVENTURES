import { useState } from "react";
import { Users } from "lucide-react";
import { AJAX, BAYERN, POSITION_LABEL, type Position, type Squad } from "@/lib/squads";
import { TeamCrest } from "@/components/TeamCrest";
import credits from "@/lib/media-credits.json";

type PlayerMedia = { file?: string; artist?: string };
const PLAYER_MEDIA = credits.players as Record<string, PlayerMedia>;

const ORDER: Position[] = ["GK", "DF", "MF", "FW"];

function SquadList({ squad }: { squad: Squad }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>Head coach: <strong className="text-foreground">{squad.coach}</strong></span>
        <span className="text-xs">Registered squad as of {squad.asOf}</span>
      </div>

      {ORDER.map((pos) => {
        const players = squad.players.filter((p) => p.pos === pos);
        if (!players.length) return null;
        return (
          <div key={pos} className="mt-5">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">{POSITION_LABEL[pos]}</h4>
            <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {players.map((p) => (
                <li key={p.no} className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/70 px-2.5 py-2">
                  <span className="relative h-12 w-12 shrink-0">
                    {PLAYER_MEDIA[p.name]?.file ? (
                      <img
                        src={PLAYER_MEDIA[p.name].file}
                        alt={p.name}
                        loading="lazy"
                        className="h-12 w-12 rounded-full border border-white/20 object-cover object-top"
                      />
                    ) : (
                      <span className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-secondary font-display text-xs font-extrabold text-muted-foreground">
                        {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </span>
                    )}
                    <span className="absolute -bottom-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-ember px-1 text-[10px] font-extrabold text-primary-foreground ring-2 ring-background">
                      {p.no}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block break-words text-[12.5px] font-semibold leading-tight sm:text-[13px]">{p.name}</span>
                    {p.note && <span className="block text-[10px] font-bold uppercase tracking-wider text-gold">{p.note}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/** Bayern Munich and Ajax squads for the Talanta Stadium opening match. */
export function Squads() {
  const [tab, setTab] = useState<"bayern" | "ajax">("bayern");
  const squad = tab === "bayern" ? BAYERN : AJAX;

  return (
    <section aria-labelledby="squads-title" className="scroll-mt-28">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-accent" />
        <h2 id="squads-title" className="font-display text-2xl font-bold sm:text-3xl">Meet the teams</h2>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:max-w-md" role="tablist">
        {[BAYERN, AJAX].map((s) => {
          const key = s.club === "Ajax" ? "ajax" : "bayern";
          const active = tab === key;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                active ? "border-gold bg-gradient-gold text-black shadow-gold" : "border-border/70 bg-card/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <TeamCrest name={s.club} size={26} />
              {s.club}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <SquadList squad={squad} />
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
        Squads are each club&apos;s registered first team and may change. The travelling squads are announced by the clubs closer to
        the match. Player photos are freely licensed images from Wikimedia Commons — see <a href="/credits" className="underline hover:text-foreground">photo credits</a>.
      </p>
    </section>
  );
}
