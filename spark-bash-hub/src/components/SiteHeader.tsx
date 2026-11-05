import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/talanta-sports-city-logo.png";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/organizers", label: "Stadiums" },
  { to: "/events", label: "Fixtures" },
  { to: "/gallery", label: "Gallery" },
  { to: "/ambassadors", label: "Fan Clubs" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="flag-stripe" />
      <div className="w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <img src={logo} alt="Talanta Sports City" className="h-11 w-auto object-contain" />
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/20 bg-black/40 transition hover:bg-white/10"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="absolute inset-x-0 top-full border-b border-white/10 bg-black/90 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-4 py-5">
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
            <Link
              to="/events"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-gradient-ember px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-ember"
            >
              Book a Match
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
