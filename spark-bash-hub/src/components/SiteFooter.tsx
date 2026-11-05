import { Link } from "@tanstack/react-router";
import logo from "@/assets/talanta-sports-city-logo.png";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="flag-stripe" />
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <img src={logo} alt="Talanta Sports City" className="h-14 w-auto object-contain" />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Book your seat at Kenyan football matches - from the new Talanta Stadium to Kasarani and Nyayo. League nights, derbies and Harambee Stars internationals, paid by M-PESA.
            </p>
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
            <h4 className="text-sm font-semibold">Talanta Sports City</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground">About</Link></li>
              <li><Link to="/events" className="hover:text-foreground">Fixtures</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Talanta Sports City · Made in Kenya.</p>
          <p>
            Photos &amp; logos via Wikimedia Commons - <Link to="/credits" className="underline hover:text-foreground">photo credits</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
