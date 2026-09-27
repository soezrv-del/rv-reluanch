import { useEffect, useRef, useState } from "react";
import { lotUnitPhoto, type LotUnit } from "@/lib/lot/ownLotPage";
import { useShellNavOptional } from "@/components/shell/ShellNavContext";
import { decideCalOpen } from "@/lib/rv/calHandoff";
import {
  computeLoan,
  formatMoney,
  formatPct,
  TERM_PRESETS,
} from "@/lib/rv/rvCal";
import {
  deskWhisper,
  lotFilterLabel,
  lotRowTitle,
  stockLine,
  unitEngine,
  unitLength,
  unitMiles,
  unitOwner,
  unitPrice,
  unitRecalls,
  type LotFilter,
} from "./foxData";

function useTick(active: boolean, target: number | null) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!active || target == null) return;
    let frame = 0;
    const start = performance.now();
    const dur = 1100;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - t) ** 3;
      setShown(Math.round(eased * target));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    setShown(0);
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);
  return shown;
}

export function HomeRoom({
  active,
  total,
  desk,
  failed,
}: {
  active: boolean;
  total: number | null;
  desk: LotUnit | null;
  failed: boolean;
}) {
  const shown = useTick(active, total);
  const photo = desk ? lotUnitPhoto(desk) : null;
  const [photoOk, setPhotoOk] = useState(true);
  useEffect(() => setPhotoOk(true), [photo]);

  return (
    <section className="fox-room" data-fox-home>
      {photo && photoOk ? (
        <img
          className="fox-coach"
          src={photo}
          alt=""
          data-fox-coach
          onError={() => setPhotoOk(false)}
        />
      ) : (
        <div className="fox-void" data-fox-coach="void" />
      )}
      <p className="fox-hero" data-fox-count data-fox-total={total ?? ""}>
        {failed ? "—" : total == null ? "" : shown.toLocaleString("en-US")}
      </p>
      <p className="fox-whisper">{failed ? "Lot snapshot unavailable" : deskWhisper(desk)}</p>
    </section>
  );
}

export function FactsRoom({ desk }: { desk: LotUnit | null }) {
  const price = desk ? unitPrice(desk) : "—";
  const whisper = desk ? stockLine(desk) : "— · —";
  const rows = desk
    ? [
        ["Length", unitLength(desk)],
        ["Engine", unitEngine(desk)],
        ["Recalls", unitRecalls(desk)],
        ["Owner", unitOwner(desk)],
        ["Miles", unitMiles(desk)],
      ]
    : [
        ["Length", "—"],
        ["Engine", "—"],
        ["Recalls", "—"],
        ["Owner", "—"],
        ["Miles", "—"],
      ];

  return (
    <section className="fox-room" data-fox-facts>
      <p className="fox-hero" data-fox-price>
        {price}
      </p>
      <p className="fox-whisper">{whisper}</p>
      <div className="fox-rows">
        {rows.map(([label, value]) => (
          <div key={label} className="fox-row" data-fox-row={label}>
            <span>{label}</span>
            <span data-fox-miles={label === "Miles" ? "" : undefined}>{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LotRoom({
  rows,
  filter,
  totalKnown,
  failed,
  onOpen,
}: {
  rows: LotUnit[];
  filter: LotFilter;
  totalKnown: boolean;
  failed: boolean;
  onOpen: (unit: LotUnit) => void;
}) {
  const label = lotFilterLabel(filter);
  const count = totalKnown ? rows.length : null;

  return (
    <section className="fox-room fox-room-lot" data-fox-lot>
      {label ? <p className="fox-kicker">{label}</p> : null}
      <p className="fox-hero" data-fox-lot-count>
        {failed ? "—" : count == null ? "" : count.toLocaleString("en-US")}
      </p>
      <p className="fox-whisper">{failed ? "Lot snapshot unavailable" : "on the sheet"}</p>
      <ul className="fox-list" data-fox-lot-list>
        {rows.map((unit, index) => {
          const stock = unit.stock_number.trim();
          return (
            <li key={`${stock}|${unit.vin}|${index}`}>
              <button type="button" className="fox-lot-row" onClick={() => onOpen(unit)}>
                <p className="fox-lot-stock">{stock || "—"}</p>
                <p className="fox-lot-meta">{lotRowTitle(unit) || "—"}</p>
                <p className="fox-lot-miles" data-lot-miles>
                  {unitMiles(unit)}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const ESTIMATE =
  "Estimates only — confirm rates with a lender";

export function CalRoom({
  active,
  price,
  downPct,
  termMonths,
  apr,
  onReset,
  onApply,
}: {
  active: boolean;
  price: number;
  downPct: number | null;
  termMonths: number | null;
  apr: number | null;
  onReset: () => void;
  onApply: (price: number) => void;
}) {
  const nav = useShellNavOptional();
  const lastSeed = useRef(0);
  const lastClean = useRef(0);
  const [priceDraft, setPriceDraft] = useState<string | null>(null);

  useEffect(() => {
    const seed = nav?.calSeed ?? null;
    const cleanToken = nav?.calCleanToken ?? 0;
    const decision = decideCalOpen({
      seed,
      lastSeedToken: lastSeed.current,
      cleanToken,
      lastCleanToken: lastClean.current,
    });
    if (seed) lastSeed.current = seed.token;
    if (cleanToken) lastClean.current = cleanToken;
    if (decision.action === "reset") {
      onReset();
      setPriceDraft(null);
      nav?.clearCalSeed();
      return;
    }
    if (decision.action !== "apply") return;
    onReset();
    onApply(decision.payload.price);
    setPriceDraft(null);
    nav?.clearCalSeed();
  }, [nav, nav?.calSeed, nav?.calCleanToken, onReset, onApply]);

  const ready =
    price > 0 && downPct != null && termMonths != null && apr != null;
  const monthly = ready
    ? computeLoan({
        price,
        downPayment: (price * downPct) / 100,
        apr,
        termMonths,
        taxRate: 0,
        registrationFees: 0,
        fees: 0,
      }).monthlyPayment
    : null;

  const hero =
    monthly != null
      ? formatMoney(monthly)
      : price > 0
        ? formatMoney(price)
        : "—";
  const whisper = monthly != null ? "monthly" : price > 0 ? "asking" : "";
  const termLabel =
    TERM_PRESETS.find((term) => term.months === termMonths)?.label ?? "—";

  return (
    <section className="fox-room" data-fox-cal data-cal-active={active ? "" : undefined}>
      <p className="fox-hero" data-fox-cal-hero>
        {hero}
      </p>
      <p className="fox-whisper">{whisper}</p>
      <div className="fox-rows">
        <div className="fox-row" data-fox-row="Price">
          <span>Price</span>
          {priceDraft != null ? (
            <input
              className="fox-price"
              inputMode="decimal"
              autoFocus
              value={priceDraft}
              aria-label="Price"
              onChange={(event) => setPriceDraft(event.target.value)}
              onBlur={() => {
                const next = Number(priceDraft.replace(/[^0-9.]/g, ""));
                if (Number.isFinite(next) && next > 0) onApply(Math.round(next));
                setPriceDraft(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") (event.target as HTMLInputElement).blur();
              }}
            />
          ) : (
            <button type="button" className="fox-row-btn" onClick={() => setPriceDraft(price > 0 ? String(price) : "")}>
              {price > 0 ? formatMoney(price) : "—"}
            </button>
          )}
        </div>
        <div className="fox-row" data-fox-row="Down">
          <span>Down</span>
          <span>{downPct == null ? "—" : `${downPct}%`}</span>
        </div>
        <div className="fox-row" data-fox-row="Term">
          <span>Term</span>
          <span>{termMonths == null ? "—" : termLabel}</span>
        </div>
        <div className="fox-row" data-fox-row="Rate">
          <span>Rate</span>
          <span>{apr == null ? "—" : formatPct(apr)}</span>
        </div>
      </div>
      <p className="fox-estimate">{ESTIMATE}</p>
    </section>
  );
}
