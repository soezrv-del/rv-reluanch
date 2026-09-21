import { lotTypeFamily, type LotTypeFamily } from "@/lib/lot/ownLotPage";

export function LotTypeMark({
  type,
  featured,
}: {
  type: string;
  featured?: boolean;
}) {
  const family = lotTypeFamily(type);
  return (
    <svg
      viewBox="0 0 320 150"
      className="lot-mark"
      aria-hidden
      data-lot-mark={family}
    >
      <ellipse className="lot-mark-shadow" cx="160" cy="134" rx="120" ry="9" />
      <LotStudioCoach family={family} featured={Boolean(featured)} />
    </svg>
  );
}

function LotStudioCoach({
  family,
}: {
  family: LotTypeFamily;
  featured: boolean;
}) {
  switch (family) {
    case "b":
      return (
        <g>
          <path
            className="lot-mark-body"
            d="M58 108h204c8 0 14-6 16-14 3-12-2-22-12-28l-18-10H86c-16 0-28 8-36 20-6 8-10 18-10 24 0 5 4 8 8 8z"
          />
          <path
            className="lot-mark-glass"
            d="M214 62c12 4 22 12 26 22h-48V74c0-6 8-12 22-12z"
          />
          <rect className="lot-mark-glass" x="92" y="70" width="36" height="18" rx="3" />
          <rect className="lot-mark-glass" x="136" y="70" width="36" height="18" rx="3" />
          <rect className="lot-mark-glass" x="180" y="70" width="22" height="18" rx="3" />
          <circle className="lot-mark-tire" cx="96" cy="112" r="13" />
          <circle className="lot-mark-hub" cx="96" cy="112" r="5" />
          <circle className="lot-mark-tire" cx="228" cy="112" r="13" />
          <circle className="lot-mark-hub" cx="228" cy="112" r="5" />
        </g>
      );
    case "a":
      return (
        <g>
          <path
            className="lot-mark-body"
            d="M28 108h268c6 0 10-4 10-10V78c0-16-10-26-24-26H48c-12 0-20 8-24 18v28c0 6 4 10 4 10z"
          />
          <rect className="lot-mark-glass" x="44" y="62" width="32" height="20" rx="3" />
          <rect className="lot-mark-glass" x="86" y="62" width="42" height="20" rx="3" />
          <rect className="lot-mark-glass" x="136" y="62" width="42" height="20" rx="3" />
          <rect className="lot-mark-glass" x="186" y="62" width="42" height="20" rx="3" />
          <rect className="lot-mark-glass" x="236" y="62" width="36" height="20" rx="3" />
          <circle className="lot-mark-tire" cx="72" cy="114" r="13" />
          <circle className="lot-mark-hub" cx="72" cy="114" r="5" />
          <circle className="lot-mark-tire" cx="248" cy="114" r="13" />
          <circle className="lot-mark-hub" cx="248" cy="114" r="5" />
        </g>
      );
    case "c":
      return (
        <g>
          <path
            className="lot-mark-body"
            d="M36 108h250c8 0 12-6 12-12V76c0-14-10-22-22-22H92c-10 0-18 6-22 14L54 86H36c-6 0-8 4-8 8 0 8 4 14 8 14z"
          />
          <path className="lot-mark-glass" d="M36 78h28l12 16H36z" />
          <rect className="lot-mark-glass" x="102" y="64" width="40" height="18" rx="3" />
          <rect className="lot-mark-glass" x="150" y="64" width="40" height="18" rx="3" />
          <rect className="lot-mark-glass" x="198" y="64" width="40" height="18" rx="3" />
          <circle className="lot-mark-tire" cx="78" cy="114" r="13" />
          <circle className="lot-mark-hub" cx="78" cy="114" r="5" />
          <circle className="lot-mark-tire" cx="246" cy="114" r="13" />
          <circle className="lot-mark-hub" cx="246" cy="114" r="5" />
        </g>
      );
    case "fw":
      return (
        <g>
          <path
            className="lot-mark-body"
            d="M92 108h200c8 0 12-6 12-12V62c0-12-8-20-20-20H112c-12 0-20 8-22 18l-8 28H92c-6 0-8 4-8 8 0 8 4 12 8 12z"
          />
          <path
            className="lot-mark-body"
            d="M42 92h52c4 0 6 2 6 6v10H48c-8 0-14-4-14-10 0-4 4-6 8-6z"
          />
          <rect className="lot-mark-glass" x="122" y="54" width="36" height="18" rx="3" />
          <rect className="lot-mark-glass" x="166" y="54" width="36" height="18" rx="3" />
          <rect className="lot-mark-glass" x="210" y="54" width="36" height="18" rx="3" />
          <circle className="lot-mark-tire" cx="148" cy="114" r="13" />
          <circle className="lot-mark-hub" cx="148" cy="114" r="5" />
          <circle className="lot-mark-tire" cx="248" cy="114" r="13" />
          <circle className="lot-mark-hub" cx="248" cy="114" r="5" />
        </g>
      );
    case "toy":
      return (
        <g>
          <path
            className="lot-mark-body"
            d="M40 108h232c8 0 12-6 12-12V66c0-12-8-20-20-20H62c-12 0-20 8-22 18v32c0 8 6 12 10 12z"
          />
          <path className="lot-mark-glass" d="M252 56l20 40h-28V66c0-6 2-10 8-10z" />
          <rect className="lot-mark-glass" x="72" y="58" width="36" height="18" rx="3" />
          <rect className="lot-mark-glass" x="116" y="58" width="36" height="18" rx="3" />
          <rect className="lot-mark-glass" x="160" y="58" width="36" height="18" rx="3" />
          <circle className="lot-mark-tire" cx="96" cy="114" r="13" />
          <circle className="lot-mark-hub" cx="96" cy="114" r="5" />
          <circle className="lot-mark-tire" cx="236" cy="114" r="13" />
          <circle className="lot-mark-hub" cx="236" cy="114" r="5" />
        </g>
      );
    case "camper":
      return (
        <g>
          <path className="lot-mark-body" d="M36 100h80v16H44c-6 0-8-4-8-8 0-5 4-8 8-8z" />
          <path
            className="lot-mark-body"
            d="M104 108h140c8 0 12-6 12-12V58c0-10-8-16-16-16h-98c-10 0-16 6-18 14v40c0 8 6 12 12 12z"
          />
          <rect className="lot-mark-glass" x="128" y="54" width="36" height="18" rx="3" />
          <rect className="lot-mark-glass" x="172" y="54" width="36" height="18" rx="3" />
          <circle className="lot-mark-tire" cx="72" cy="114" r="13" />
          <circle className="lot-mark-hub" cx="72" cy="114" r="5" />
          <circle className="lot-mark-tire" cx="220" cy="114" r="13" />
          <circle className="lot-mark-hub" cx="220" cy="114" r="5" />
        </g>
      );
    default:
      return (
        <g>
          <path
            className="lot-mark-body"
            d="M48 108h236c8 0 12-6 12-12V64c0-12-8-20-20-20H70c-14 0-22 8-24 18v34c0 8 6 12 12 12z"
          />
          <path className="lot-mark-body" d="M22 96h28v12H26c-4 0-6-2-6-6s2-6 2-6z" />
          <rect className="lot-mark-glass" x="80" y="56" width="40" height="20" rx="3" />
          <rect className="lot-mark-glass" x="128" y="56" width="40" height="20" rx="3" />
          <rect className="lot-mark-glass" x="176" y="56" width="40" height="20" rx="3" />
          <circle className="lot-mark-tire" cx="108" cy="114" r="13" />
          <circle className="lot-mark-hub" cx="108" cy="114" r="5" />
          <circle className="lot-mark-tire" cx="240" cy="114" r="13" />
          <circle className="lot-mark-hub" cx="240" cy="114" r="5" />
        </g>
      );
  }
}
