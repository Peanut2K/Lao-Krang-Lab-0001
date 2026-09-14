/**
 * Every mark in the app, drawn as one-weight line art on a 24-unit grid so a
 * category icon, a tab glyph and the logo all read as the same hand.
 *
 * These replace the Unicode glyphs (⌂ ⌘ ✽ 🔍 ☰) that used to stand in for
 * icons — those rendered as whatever each device had and never matched.
 */

type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false as const,
});

/* ---------- logo ---------- */

/**
 * A single kanok — the smallest unit of Thai ornament — curling inside the
 * square of the archive that holds it. The flame tip is the one gold accent.
 */
export function Logo({ size = 40, title }: { size?: number; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect x="2" y="2" width="44" height="44" rx="12" fill="var(--green)" />
      {/*
        A temple gable: the rakes carry the chofa finial that tops every Thai
        wihan, and the gold curl inside is a single kanok. Both shapes stay
        solid rather than stroked, so the mark still reads at 16px.
      */}
      <path
        d="M24 10.2 37.8 34.5h-5.3L24 20 15.5 34.5h-5.3z"
        fill="var(--surface)"
      />
      {/* chofa — the horn that sweeps off the apex */}
      <path
        d="M24 10.2c-.2-2.8.9-4.8 3.3-6-.7 2.4-.5 4.3.6 5.7-1.5-.5-2.8-.4-3.9.3z"
        fill="var(--gold)"
      />
      {/* the pediment field, where the carved pattern sits */}
      <path d="M24 23.2 31.4 34.5H16.6z" fill="var(--gold)" />
      <path d="M12.5 39.5h23" stroke="var(--surface)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Logo + wordmark, for the login and signup screens. */
export function Wordmark({ size = 44 }: { size?: number }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Logo size={size} title="คลังลวดลายไทย" />
      <span style={{ display: "block" }}>
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-serif)",
            fontSize: size * 0.48,
            fontWeight: 600,
            color: "var(--ink)",
            lineHeight: 1.2,
          }}
        >
          คลังลวดลายไทย
        </span>
        <span style={{ display: "block", fontSize: size * 0.23, color: "var(--ink-3)", marginTop: 2 }}>
          Thai Pattern Archive
        </span>
      </span>
    </span>
  );
}

/* ---------- chrome ---------- */

export function SearchIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.4 15.4 20 20" />
    </svg>
  );
}

export function MenuIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function BackIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M14.5 5 8 12l6.5 7" />
    </svg>
  );
}

/* ---------- tab bar ---------- */

export function CaptureIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2a1.5 1.5 0 0 0 1.3-.8l.8-1.4A1.5 1.5 0 0 1 10.1 4h3.8a1.5 1.5 0 0 1 1.3.8l.8 1.4a1.5 1.5 0 0 0 1.3.8h2.2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </svg>
  );
}

export function GalleryIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M3.5 15l4.2-3.6a1.5 1.5 0 0 1 2 0l3.4 3 2-1.7a1.5 1.5 0 0 1 2 0l3.4 2.9" />
      <circle cx="9" cy="9" r="1.3" />
    </svg>
  );
}

export function ExploreIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.2 8.8 13.6 13.6 8.8 15.2l1.6-4.8z" />
    </svg>
  );
}

export function ProfileIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.8 19.5a7.2 7.2 0 0 1 14.4 0" />
    </svg>
  );
}

/* ---------- object categories ---------- */

/** สถาปัตยกรรม — a gabled roof with the chofa finial. */
function Architecture({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 3.5 4.5 10v10h15V10z" />
      <path d="M12 3.5 13.8 1.8" />
      <path d="M9.5 20v-5.5h5V20" />
    </svg>
  );
}

/** เครื่องใช้ — a lidded household jar. */
function Household({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M6.5 9h11v8.5a2.5 2.5 0 0 1-2.5 2.5H9a2.5 2.5 0 0 1-2.5-2.5z" />
      <path d="M5 6.5h14" />
      <path d="M10.5 3.5h3v3h-3z" />
    </svg>
  );
}

/** วัตถุพิธีกรรม — a lotus offering. */
function Ritual({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M12 4c1.8 2.2 2.6 4.4 2.6 6.6 0 2-.9 3.4-2.6 3.4s-2.6-1.4-2.6-3.4C9.4 8.4 10.2 6.2 12 4z" />
      <path d="M9.4 10.6C7.6 9.4 5.8 9 4 9.4c.6 2.6 2 4.2 4.2 4.8" />
      <path d="M14.6 10.6c1.8-1.2 3.6-1.6 5.4-1.2-.6 2.6-2 4.2-4.2 4.8" />
      <path d="M6 17.5h12" />
    </svg>
  );
}

/** เครื่องแต่งกาย — a folded length of cloth. */
function Textile({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M3.5 4.5h17" />
      <path d="M5.5 4.5v11c0 1.7 2.9 2.5 6.5 2.5s6.5-.8 6.5-2.5v-11" />
      <path d="M8.8 18.2v2.3M12 18.5v2.5M15.2 18.2v2.3" />
    </svg>
  );
}

/** เครื่องจักสาน — a woven basket. */
function Basketry({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M4 8.5h16l-1.6 9.2a2 2 0 0 1-2 1.8H7.6a2 2 0 0 1-2-1.8z" />
      <path d="M8 8.5c0-2.8 1.8-4.5 4-4.5s4 1.7 4 4.5" />
      <path d="M9.2 12v5M14.8 12v5M5.4 13.5h13.2" />
    </svg>
  );
}

/** เครื่องประดับ — a faceted gem. */
function Jewellery({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="15" r="5.5" />
      <path d="M9 6.5h6l-3 3.8z" />
      <path d="M9 6.5 12 3h0l3 3.5" />
    </svg>
  );
}

/** ภาชนะ — a footed bowl. */
function Vessel({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M3.5 9h17c0 4.6-3.8 8-8.5 8S3.5 13.6 3.5 9z" />
      <path d="M12 17v3M8.5 20h7" />
    </svg>
  );
}

/** เครื่องดนตรี — a bowed string instrument. */
function Instrument({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <ellipse cx="12" cy="6.5" rx="7.5" ry="3" />
      <path d="M4.5 6.5v8.2c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6.5" />
      <path d="M6.6 9.4 9 13.6M17.4 9.4 15 13.6M12 9.5v5.2" />
    </svg>
  );
}

/** อื่น ๆ — a kanok curl, the archive's own mark. */
function Other({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M5 19c0-6.2 2.6-10.2 6.6-11.8 3-1.2 5.4-.2 5.9 2.1.4 2-1 3.6-2.8 3.6-1.5 0-2.5-1-2.5-2.3 0-1 .7-1.8 1.6-2" />
      <path d="M16.5 6c1.3-1.8 2.8-3 4.5-3.4-.8 1.8-1 3.5-.7 5" />
    </svg>
  );
}

const CATEGORY: Record<string, (p: IconProps) => React.JSX.Element> = {
  สถาปัตยกรรม: Architecture,
  เครื่องใช้: Household,
  วัตถุพิธีกรรม: Ritual,
  เครื่องแต่งกาย: Textile,
  เครื่องจักสาน: Basketry,
  เครื่องประดับ: Jewellery,
  ภาชนะ: Vessel,
  เครื่องดนตรี: Instrument,
  "อื่น ๆ": Other,
};

/** Legacy glyphs stored in `albums.icon` still map to the drawn set. */
const GLYPH: Record<string, string> = {
  "⌂": "สถาปัตยกรรม",
  "⌘": "เครื่องใช้",
  "✽": "วัตถุพิธีกรรม",
  "✂": "เครื่องแต่งกาย",
  "⌗": "เครื่องจักสาน",
  "◈": "เครื่องประดับ",
  "◡": "ภาชนะ",
  "♪": "เครื่องดนตรี",
  "✦": "อื่น ๆ",
};

/** Draws the icon for an object type, an album glyph, or falls back to อื่น ๆ. */
export function CategoryIcon({ name, size = 20 }: { name?: string | null; size?: number }) {
  const key = (name && (CATEGORY[name] ? name : GLYPH[name])) || "อื่น ๆ";
  const Drawn = CATEGORY[key] ?? Other;
  return <Drawn size={size} />;
}
