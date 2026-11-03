import { Link } from "@tanstack/react-router";
import { Instagram, Music2, Phone, Mail } from "lucide-react";
import logo from "@/assets/football-arena254-logo.svg";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="flag-stripe" />
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="Football Arena254" className="h-14 w-14 object-contain drop-shadow-[0_4px_14px_rgba(40,220,120,0.3)]" />
              <span className="font-display text-lg font-bold">
                <span className="text-gradient-ember">FOOTBALL</span> ARENA<span className="text-crimson">254</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Book your seat at Kenyan football matches — from the new Talanta Stadium to Kasarani and Nyayo. League nights, derbies and Harambee Stars internationals, paid by M-PESA.
            </p>
            <div className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="tel:+254705333198" className="inline-flex items-center gap-2 hover:text-foreground">
                <Phone className="h-4 w-4 text-accent" />+254 705 333 198
              </a>
              <a href="mailto:hello@footballarena254.co.ke" className="inline-flex items-center gap-2 hover:text-foreground">
                <Mail className="h-4 w-4 text-accent" />hello@footballarena254.co.ke
              </a>
            </div>
            <div className="mt-5 flex gap-3">
              <a href="https://www.instagram.com/footballarena254" target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 transition hover:bg-secondary"><Instagram className="h-4 w-4" /></a>
              <a href="https://www.tiktok.com/@footballarena254" target="_blank" rel="noreferrer" aria-label="TikTok" className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 transition hover:bg-secondary"><Music2 className="h-4 w-4" /></a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Matchday</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/events" className="hover:text-foreground">Fixtures &amp; Tickets</Link></li>
              <li><Link to="/organizers" className="hover:text-foreground">Stadiums</Link></li>
              <li><Link to="/gallery" className="hover:text-foreground">Gallery</Link></li>
              <li><Link to="/ambassadors" className="hover:text-foreground">Fan Club Ambassadors</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Football Arena254</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground">About</Link></li>
              <li><Link to="/events" className="hover:text-foreground">Fixtures</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} footballarena254.co.ke · Made in Kenya.</p>
          <p>
            Photos: Wikimedia Commons — Talanta Stadium by Raymond Omollo (CC0); match photos by Sila Kiplagat, Endesia94 and Eriksson1904 (CC BY-SA 4.0).
          </p>
        </div>
      </div>
    </footer>
  );
}
