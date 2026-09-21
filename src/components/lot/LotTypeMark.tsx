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
      viewBox="0 0 360 170"
      className="lot-mark"
      aria-hidden
      data-lot-mark={family}
    >
      <ellipse className="lot-mark-shadow" cx="188" cy="154" rx="128" ry="10" />
      <QuarterCoach family={family} />
    </svg>
  );
}

function QuarterCoach({ family }: { family: LotTypeFamily }) {
  switch (family) {
    case "b":
      return (
        <g>
          <path
            className="lot-mark-shade"
            d="M86 128h196c18 0 32-10 38-26 4-12 0-24-10-32L246 44H132c-22 0-40 14-50 34-8 14-12 28-10 40 2 8 8 10 14 10z"
          />
          <path
            className="lot-mark-body"
            d="M78 126h188c16 0 28-8 34-22 4-10-2-22-12-30L234 50H128c-20 0-36 12-46 30-8 14-12 26-10 36 2 6 8 10 16 10z"
          />
          <path
            className="lot-mark-glass"
            d="M232 58c16 6 28 16 34 28h-62V70c0-8 10-12 28-12z"
          />
          <rect className="lot-mark-glass" x="118" y="68" width="32" height="20" rx="3" />
          <rect className="lot-mark-glass" x="156" y="66" width="34" height="20" rx="3" />
          <rect className="lot-mark-glass" x="196" y="64" width="22" height="20" rx="3" />
          <circle className="lot-mark-tire" cx="124" cy="130" r="15" />
          <circle className="lot-mark-hub" cx="124" cy="130" r="6" />
          <circle className="lot-mark-tire" cx="250" cy="128" r="15" />
          <circle className="lot-mark-hub" cx="250" cy="128" r="6" />
        </g>
      );
    case "a":
      return (
        <g>
          <path
            className="lot-mark-shade"
            d="M48 130h268c12 0 18-8 18-16V78c0-18-12-28-28-28H86c-20 0-34 12-40 28v36c0 10 8 16 12 16z"
          />
          <path
            className="lot-mark-body"
            d="M42 128h258c10 0 16-6 16-14V80c0-16-10-26-24-26H82c-18 0-30 10-36 24v36c0 8 6 14 12 14z"
          />
          <path className="lot-mark-glass" d="M48 78h36l8 22H46z" />
          <rect className="lot-mark-glass" x="98" y="64" width="38" height="20" rx="3" />
          <rect className="lot-mark-glass" x="144" y="62" width="40" height="20" rx="3" />
          <rect className="lot-mark-glass" x="192" y="62" width="40" height="20" rx="3" />
          <rect className="lot-mark-glass" x="240" y="64" width="36" height="20" rx="3" />
          <circle className="lot-mark-tire" cx="92" cy="132" r="15" />
          <circle className="lot-mark-hub" cx="92" cy="132" r="6" />
          <circle className="lot-mark-tire" cx="268" cy="130" r="15" />
          <circle className="lot-mark-hub" cx="268" cy="130" r="6" />
        </g>
      );
    case "c":
      return (
        <g>
          <path
            className="lot-mark-shade"
            d="M52 130h250c14 0 20-8 20-16V82c0-16-12-26-26-26H118c-16 0-28 10-34 22L68 98H50c-8 0-12 6-12 12 0 12 6 20 14 20z"
          />
          <path
            className="lot-mark-body"
            d="M46 128h242c12 0 18-6 18-14V84c0-14-10-24-22-24H114c-14 0-24 8-30 20L64 98H46c-6 0-10 4-10 10 0 12 6 20 10 20z"
          />
          <path className="lot-mark-glass" d="M46 86h32l14 18H46z" />
          <rect className="lot-mark-glass" x="122" y="70" width="36" height="18" rx="3" />
          <rect className="lot-mark-glass" x="166" y="68" width="36" height="18" rx="3" />
          <rect className="lot-mark-glass" x="210" y="68" width="36" height="18" rx="3" />
          <circle className="lot-mark-tire" cx="96" cy="132" r="15" />
          <circle className="lot-mark-hub" cx="96" cy="132" r="6" />
          <circle className="lot-mark-tire" cx="262" cy="130" r="15" />
          <circle className="lot-mark-hub" cx="262" cy="130" r="6" />
        </g>
      );
    case "fw":
      return (
        <g>
          <path
            className="lot-mark-shade"
            d="M128 46h188c14 0 22 10 22 22v52c0 8-6 12-16 12H128c-10 0-16-6-16-14V58c0-8 6-12 16-12z"
          />
          <path
            className="lot-mark-body"
            d="M122 48h180c12 0 20 8 20 20v48c0 6-4 10-14 10H122c-8 0-14-4-14-12V58c0-6 4-10 14-10z"
          />
          <path
            className="lot-mark-body"
            d="M92 48h34v74H100c-8 0-12-8-12-16V60c0-8 4-12 12-12z"
          />
          <path
            className="lot-mark-shade"
            d="M44 102h52v16H54c-10 0-16-4-16-8 0-6 2-8 6-8z"
          />
          <rect className="lot-mark-glass" x="144" y="60" width="32" height="18" rx="3" />
          <rect className="lot-mark-glass" x="184" y="58" width="34" height="18" rx="3" />
          <rect className="lot-mark-glass" x="226" y="58" width="34" height="18" rx="3" />
          <circle className="lot-mark-tire" cx="176" cy="134" r="13" />
          <circle className="lot-mark-hub" cx="176" cy="134" r="5" />
          <circle className="lot-mark-tire" cx="212" cy="134" r="13" />
          <circle className="lot-mark-hub" cx="212" cy="134" r="5" />
          <circle className="lot-mark-tire" cx="278" cy="132" r="13" />
          <circle className="lot-mark-hub" cx="278" cy="132" r="5" />
        </g>
      );
    case "toy":
      return (
        <g>
          <path
            className="lot-mark-shade"
            d="M58 128h236c14 0 20-8 20-16V74c0-16-10-24-24-24H86c-18 0-30 10-34 24v38c0 10 8 16 16 16z"
          />
          <path
            className="lot-mark-body"
            d="M52 126h228c12 0 18-6 18-14V76c0-14-8-22-20-22H82c-16 0-26 8-30 22v36c0 8 6 14 14 14z"
          />
          <path className="lot-mark-glass" d="M268 64l22 46h-30V76c0-8 2-12 8-12z" />
          <rect className="lot-mark-glass" x="88" y="66" width="34" height="18" rx="3" />
          <rect className="lot-mark-glass" x="130" y="64" width="34" height="18" rx="3" />
          <rect className="lot-mark-glass" x="172" y="64" width="34" height="18" rx="3" />
          <circle className="lot-mark-tire" cx="112" cy="132" r="14" />
          <circle className="lot-mark-hub" cx="112" cy="132" r="5" />
          <circle className="lot-mark-tire" cx="254" cy="130" r="14" />
          <circle className="lot-mark-hub" cx="254" cy="130" r="5" />
        </g>
      );
    case "camper":
      return (
        <g>
          <path className="lot-mark-body" d="M48 116h88v16H56c-8 0-12-4-12-8 0-6 4-8 8-8z" />
          <path
            className="lot-mark-shade"
            d="M122 128h156c12 0 18-8 18-16V66c0-12-8-18-20-18h-112c-14 0-22 8-24 18v46c0 10 8 16 16 16z"
          />
          <path
            className="lot-mark-body"
            d="M118 126h148c10 0 16-6 16-14V68c0-10-6-16-16-16H124c-12 0-18 6-20 16v42c0 8 6 16 14 16z"
          />
          <rect className="lot-mark-glass" x="148" y="62" width="34" height="18" rx="3" />
          <rect className="lot-mark-glass" x="190" y="60" width="34" height="18" rx="3" />
          <circle className="lot-mark-tire" cx="86" cy="132" r="14" />
          <circle className="lot-mark-hub" cx="86" cy="132" r="5" />
          <circle className="lot-mark-tire" cx="236" cy="130" r="14" />
          <circle className="lot-mark-hub" cx="236" cy="130" r="5" />
        </g>
      );
    default:
      return (
        <g>
          <path
            className="lot-mark-shade"
            d="M72 128h236c16 0 24-8 24-18V72c0-16-10-24-24-24H102c-20 0-34 10-38 26v38c0 10 8 16 18 16z"
          />
          <path
            className="lot-mark-body"
            d="M66 126h228c14 0 20-6 20-16V74c0-14-8-22-20-22H98c-18 0-30 8-34 22v36c0 8 6 16 16 16z"
          />
          <path className="lot-mark-body" d="M28 112h42v14H34c-6 0-8-2-8-6s2-8 2-8z" />
          <path
            className="lot-mark-glass"
            d="M96 58c10-4 22-4 28 0v28H92V70c0-6 2-10 4-12z"
          />
          <rect className="lot-mark-glass" x="134" y="62" width="36" height="20" rx="3" />
          <rect className="lot-mark-glass" x="178" y="60" width="36" height="20" rx="3" />
          <rect className="lot-mark-glass" x="222" y="60" width="32" height="20" rx="3" />
          <circle className="lot-mark-tire" cx="128" cy="132" r="14" />
          <circle className="lot-mark-hub" cx="128" cy="132" r="5" />
          <circle className="lot-mark-tire" cx="168" cy="132" r="14" />
          <circle className="lot-mark-hub" cx="168" cy="132" r="5" />
          <circle className="lot-mark-tire" cx="262" cy="130" r="14" />
          <circle className="lot-mark-hub" cx="262" cy="130" r="5" />
        </g>
      );
  }
}
