import { useEffect, useRef, useState } from "react";
import { slugify } from "@/lib/league";

// Official crest: drop a file at public/clubs/<slug>.png (e.g. gor-mahia.png) and it is used automatically.
// Until then a clean monogram badge is shown, so every club always has a crest.

const INITIALS: Record<string, string> = {
  "AFC Leopards": "AFC", "APS Bomet": "APS", "Gor Mahia": "GOR", "Kakamega Homeboyz": "KHB",
  "Kenya Police": "KPF", "Mara Sugar": "MSC", "Mathare United": "MAT", "Migori Youth": "MIG",
  "Mombasa United": "MOM", "Murang'a SEAL": "SEAL", "Nairobi United": "NBU", "Posta Rangers": "PST",
  "Ulinzi Stars": "ULI", "3K": "3K",
};

const HUES: Record<string, number> = {
  "AFC Leopards": 215, "APS Bomet": 275, "Bandari": 195, "Gor Mahia": 145, "KCB": 160,
  "Kakamega Homeboyz": 100, "Kenya Police": 235, "Mara Sugar": 45, "Mathare United": 255,
  "Migori Youth": 20, "Mombasa United": 330, "Murang'a SEAL": 5, "Nairobi United": 285,
  "Posta Rangers": 52, "Shabana": 175, "Tusker": 35, "Ulinzi Stars": 120, "3K": 310,
};

function initialsOf(name: string): string {
  return INITIALS[name] ?? name.replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase();
}

function Monogram({ name, size }: { name: string; size: number }) {
  const hue = HUES[name] ?? 150;
  const id = `mg-${slugify(name)}`;
  const text = initialsOf(name);
  const fontSize = text.length >= 4 ? 25 : text.length === 3 ? 30 : 38;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`${name} badge`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 80% 52%)`} />
          <stop offset="1" stopColor={`hsl(${hue} 85% 24%)`} />
        </linearGradient>
      </defs>
      <path d="M50 4 L90 16 V50 C90 74 72 90 50 97 C28 90 10 74 10 50 V16 Z" fill={`url(#${id})`} stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
      <path d="M50 4 L90 16 V36 C70 30 30 30 10 36 V16 Z" fill="#fff" fillOpacity="0.16" />
      <text x="50" y="62" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize={fontSize} fill="#fff" stroke="rgba(0,0,0,.35)" strokeWidth="1.2" paintOrder="stroke">
        {text}
      </text>
    </svg>
  );
}

export function TeamCrest({ name, size = 64, className = "" }: { name: string; size?: number; className?: string }) {
  // The badge is always rendered; an official crest file only replaces it once it has really loaded.
  const [official, setOfficial] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const plate = Math.round(size * 1.18);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) setOfficial(true);
  }, []);

  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center rounded-full bg-white/[0.07] ring-1 ring-white/20 shadow-[0_6px_24px_-8px_rgba(0,0,0,0.8)] backdrop-blur-sm ${className}`}
      style={{ width: plate, height: plate }}
      title={name}
    >
      {!official && <Monogram name={name} size={size} />}
      <img
        ref={imgRef}
        src={`/clubs/${slugify(name)}.png`}
        alt={official ? `${name} crest` : ""}
        aria-hidden={!official}
        width={size}
        height={size}
        onLoad={() => setOfficial(true)}
        onError={() => setOfficial(false)}
        className={official ? "object-contain" : "pointer-events-none absolute h-0 w-0 opacity-0"}
        style={official ? { width: size, height: size } : undefined}
      />
    </span>
  );
}
