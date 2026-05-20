import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Phone, Mail, Instagram, Music2 } from "lucide-react";
import logo from "@/assets/ross-ventures-logo.png";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/organizers", label: "Services" },
  { to: "/events", label: "Events" },
  { to: "/ambassadors", label: "Ambassadors" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto mt-3 max-w-6xl px-4">
        <div className="glass flex items-center justify-between rounded-2xl px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <img src={logo} alt="Ross Ventures Limited" className="h-9 w-9 rounded-lg object-contain" />
            <span className="font-display text-base font-bold tracking-tight leading-tight sm:text-lg">
              <span className="text-gradient-ember">ROSS</span>
              <span className="ml-1 text-foreground/90">Ventures Limited</span>
              <span className="ml-2 hidden text-xs font-medium uppercase tracking-wider text-muted-foreground sm:inline">
                · Marketing & Event Planners · Nairobi
              </span>
            </span>
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-border/60 bg-background/60 transition hover:bg-secondary"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="mx-auto mt-2 max-w-6xl px-4">
          <div className="glass rounded-2xl p-5">
            <nav className="grid gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground/90 transition hover:bg-secondary hover:text-accent"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 grid gap-2 border-t border-border/60 pt-4 text-sm text-muted-foreground">
              <a href="tel:+254705333198" className="inline-flex items-center gap-2 hover:text-foreground">
                <Phone className="h-4 w-4 text-accent" />+254 705 333 198
              </a>
              <a href="mailto:hello@rossventures.co.ke" className="inline-flex items-center gap-2 hover:text-foreground">
                <Mail className="h-4 w-4 text-accent" />hello@rossventures.co.ke
              </a>
              <div className="mt-2 flex gap-2">
                <a href="https://www.instagram.com/ross_ventures1?igsh=MWluZnAyMDVtaTNrNA==" target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 transition hover:bg-secondary"><Instagram className="h-4 w-4" /></a>
                <a href="https://www.tiktok.com/@ross.ventures" target="_blank" rel="noreferrer" aria-label="TikTok" className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 transition hover:bg-secondary"><Music2 className="h-4 w-4" /></a>
              </div>
            </div>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-gradient-ember px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-ember"
            >
              Plan an Event
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
