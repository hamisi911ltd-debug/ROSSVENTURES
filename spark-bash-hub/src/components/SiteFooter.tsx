import { Link } from "@tanstack/react-router";
import { Instagram, Music2, Phone, Mail } from "lucide-react";
import logo from "@/assets/ross-ventures-logo.png";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="Ross Ventures Limited" className="h-10 w-10 rounded-lg object-contain" />
              <span className="font-display text-lg font-bold">
                <span className="text-gradient-ember">ROSS</span> Ventures
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Marketing agency and event planners. We craft moments — from campus festivals to brand activations — that move crowds and move product.
            </p>
            <div className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="tel:+254705333198" className="inline-flex items-center gap-2 hover:text-foreground">
                <Phone className="h-4 w-4 text-accent" />+254 705 333 198
              </a>
              <a href="mailto:hello@rossventures.co.ke" className="inline-flex items-center gap-2 hover:text-foreground">
                <Mail className="h-4 w-4 text-accent" />hello@rossventures.co.ke
              </a>
            </div>
            <div className="mt-5 flex gap-3">
              <a href="https://www.instagram.com/ross_ventures1?igsh=MWluZnAyMDVtaTNrNA==" target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 transition hover:bg-secondary"><Instagram className="h-4 w-4" /></a>
              <a href="https://www.tiktok.com/@ross.ventures" target="_blank" rel="noreferrer" aria-label="TikTok" className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 transition hover:bg-secondary"><Music2 className="h-4 w-4" /></a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Services</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/organizers" className="hover:text-foreground">Event Planning</Link></li>
              <li><Link to="/organizers" className="hover:text-foreground">Digital Marketing</Link></li>
              <li><Link to="/organizers" className="hover:text-foreground">BTL Marketing</Link></li>
              <li><Link to="/ambassadors" className="hover:text-foreground">Campus Activations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground">About</Link></li>
              <li><Link to="/events" className="hover:text-foreground">Our Events</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Ross Ventures Limited. Made in Kenya.</p>
          <p>Event Planners · Digital Marketing · BTL Marketing</p>
        </div>
      </div>
    </footer>
  );
}
