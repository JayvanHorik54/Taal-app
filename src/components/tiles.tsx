import type { Mastery } from "@/lib/srs";

/**
 * Zonder `label` is een tegel decoratief en slaat een schermlezer hem over.
 * Dat is bewust: het tegelveld op de muur is één plaatje van honderden tegels,
 * en de kop erboven vertelt al hoeveel er af zijn.
 */
function a11y(label?: string) {
  return label ? { role: "img" as const, "aria-label": label } : { "aria-hidden": true };
}

/**
 * De tegel is de eenheid van woordenschat: hoe beter je een woord kent,
 * hoe voller het patroon. De cenefa (Greca) is de rand van het veld en
 * staat voor grammatica — die houdt het geheel bij elkaar.
 */

export function Tile({
  level = 0,
  size = 34,
  label,
}: {
  level?: Mastery;
  size?: number;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className="block"
      {...a11y(label)}
    >
      <rect
        x="0.6"
        y="0.6"
        width="38.8"
        height="38.8"
        rx="2"
        fill="var(--surface)"
        stroke="var(--line-strong)"
        strokeWidth="1.2"
      />
      {level === 0 && <circle cx="20" cy="20" r="1.8" fill="var(--line-strong)" />}
      {level === 1 && (
        <path
          d="M20 9 L31 20 L20 31 L9 20 Z"
          fill="var(--brand-pale)"
          stroke="var(--brand-mid)"
          strokeWidth="1.2"
        />
      )}
      {level === 2 && (
        <g fill="var(--brand-mid)" stroke="var(--brand)" strokeWidth="1.1">
          <path d="M20 6 C25 12 28 15 34 20 C28 25 25 28 20 34 C15 28 12 25 6 20 C12 15 15 12 20 6 Z" />
          <circle cx="20" cy="20" r="3.4" fill="var(--surface)" stroke="none" />
        </g>
      )}
      {level === 3 && (
        <g>
          <rect x="6" y="6" width="28" height="28" fill="var(--brand)" />
          <rect
            x="6"
            y="6"
            width="28"
            height="28"
            fill="var(--brand)"
            transform="rotate(45 20 20)"
          />
          <circle cx="20" cy="20" r="5" fill="var(--accent)" />
          <circle cx="20" cy="20" r="1.9" fill="var(--surface)" />
        </g>
      )}
    </svg>
  );
}

export function Greca({
  level = 0,
  size = 30,
  label,
}: {
  level?: 0 | 1 | 2 | 3;
  size?: number;
  label?: string;
}) {
  const stroke =
    level === 0 ? "var(--line-strong)" : level === 1 ? "var(--brand-mid)" : "var(--brand)";
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className="block shrink-0"
      {...a11y(label)}
    >
      <rect
        x="0.6"
        y="0.6"
        width="38.8"
        height="38.8"
        rx="2"
        fill={level >= 2 ? "var(--brand-soft)" : "var(--surface)"}
        stroke="var(--line-strong)"
        strokeWidth="1.2"
      />
      <path
        d="M4 30 L4 14 L18 14 L18 24 L26 24 L26 10 L36 10"
        fill="none"
        stroke={stroke}
        strokeWidth={level === 3 ? 3.4 : 2.4}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {level === 3 && (
        <path d="M4 34 L36 34" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="square" />
      )}
    </svg>
  );
}
