import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Loader2,
  ScanLine,
  Search,
  Shield,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  scrollFieldIntoVisibleArea,
  useKeyboardInset,
} from "@/lib/hooks/useKeyboardInset";
import {
  decodeVinViaApi,
  isValidVinFormat,
  normalizeVin,
  type NhtsaDecodeResult,
} from "@/lib/nhtsa/decode";

const VinScanner = lazy(() =>
  import("./VinScanner").then((m) => ({ default: m.VinScanner })),
);

function DetailTile({
  label,
  value,
  accent,
  full,
}: {
  label: string;
  value: string;
  accent?: boolean;
  full?: boolean;
}) {
  if (!value || value === "—") return null;
  return (
    <div
      className={cn(
        "glass-field rounded-[var(--radius-md)] px-3 py-2.5",
        full && "col-span-2",
      )}
    >
      <p className="text-[10px] font-semibold tracking-wide text-white/70">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-[13px] font-semibold leading-snug text-white",
          accent && "text-sky-200",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.14em] text-white/80">
      {children}
    </p>
  );
}

export function VinDecoder({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const kb = useKeyboardInset();
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NhtsaDecodeResult | null>(null);
  const [expandedRecall, setExpandedRecall] = useState<string | null>(null);
  const [showPositions, setShowPositions] = useState(false);
  const [scanning, setScanning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      abortRef.current = null;
      setLoading(false);
      setScanning(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !kb.open) return;
    const el = inputRef.current;
    if (el && document.activeElement === el) {
      scrollFieldIntoVisibleArea(el, kb.inset);
    }
  }, [open, kb.open, kb.inset, kb.vvHeight]);

  const runDecode = async (override?: string) => {
    const cleaned = normalizeVin(override ?? vin);
    setVin(cleaned);
    setError(null);
    setResult(null);
    setExpandedRecall(null);
    setShowPositions(false);

    if (!isValidVinFormat(cleaned)) {
      setError("VIN must be 17 characters (letters I, O, Q are not used).");
      return;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    inputRef.current?.blur();

    const res = await decodeVinViaApi(cleaned, ctrl.signal);
    if (ctrl.signal.aborted) return;
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }
    setResult(res.data);
    window.setTimeout(() => {
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

  const onScanned = (v: string) => {
    setVin(v);
    setScanning(false);
    void runDecode(v);
  };

  if (!open) return null;

  const kbPad = kb.open ? Math.max(kb.inset, 12) : 0;
  const frameH = kb.vvHeight > 0 ? kb.vvHeight : undefined;
  const s = result?.structure;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[70] flex items-end justify-center sm:items-center"
      style={{
        height: frameH ? `${frameH}px` : "100dvh",
        top: kb.vvOffsetTop || 0,
        paddingTop: "max(0.5rem, env(safe-area-inset-top))",
        paddingBottom: kbPad
          ? `max(0.75rem, ${kbPad + 8}px)`
          : "max(0.75rem, env(safe-area-inset-bottom))",
      }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        aria-label="Dismiss"
        onClick={onClose}
      />
      <div
        className="glass-prestige-deep relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-t-[var(--radius-2xl)] sm:rounded-[var(--radius-2xl)]"
        style={{
          maxHeight: kbPad
            ? `min(92dvh, calc(var(--vv-height, 100dvh) - ${kbPad + 24}px))`
            : "min(88dvh, calc(var(--vv-height, 100dvh) - 1.5rem))",
          height: kbPad
            ? `min(92dvh, calc(var(--vv-height, 100dvh) - ${kbPad + 24}px))`
            : undefined,
        }}
        role="dialog"
        aria-modal="true"
        aria-label="VIN Decoder"
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-white/25 sm:hidden" />
        <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-4 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
          <h2 className="flex flex-1 items-center justify-center gap-2 text-[16px] font-bold text-white">
            <ScanLine className="size-4 text-blue" />
            VIN Decoder
          </h2>
          <div className="size-9" />
        </div>

        <div
          ref={scrollRef}
          data-app-scroll
          className="rv-scroll min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4"
          style={{
            WebkitOverflowScrolling: "touch",
            paddingBottom: kb.open ? 24 : 16,
          }}
        >
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-bold tracking-[0.14em] text-white">
              17-CHAR VIN
            </span>
            <input
              ref={inputRef}
              value={vin}
              onChange={(e) => {
                setVin(e.target.value.toUpperCase());
                setError(null);
              }}
              onFocus={(e) => {
                const el = e.currentTarget;
                window.setTimeout(() => scrollFieldIntoVisibleArea(el, kb.inset), 50);
                window.setTimeout(() => scrollFieldIntoVisibleArea(el, kb.inset), 300);
                window.setTimeout(() => scrollFieldIntoVisibleArea(el, kb.inset), 500);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") void runDecode();
              }}
              maxLength={17}
              spellCheck={false}
              autoCapitalize="characters"
              autoCorrect="off"
              autoComplete="off"
              enterKeyHint="search"
              inputMode="text"
              className="glass-field w-full rounded-[var(--radius-md)] px-3 py-3.5 font-mono text-[15px] tracking-wide text-white outline-none placeholder:text-white/50 focus:border-blue/50"
              placeholder="Enter 17-character VIN"
              aria-label="Vehicle identification number"
            />
            <span className="mt-1 block text-[10px] text-white/80">
              {normalizeVin(vin).length}/17 · NHTSA vPIC + ISO check digit
            </span>
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void runDecode()}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-blue py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(77,166,255,0.35)] disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              {loading ? "Decoding…" : "Decode VIN"}
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                inputRef.current?.blur();
                setScanning(true);
              }}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-blue/50 bg-blue/20 px-4 py-3.5 text-sm font-bold text-white"
            >
              <ScanLine className="size-4" />
              Scan
            </button>
          </div>

          <p className="text-[11px] leading-relaxed text-white/85">
            Full NHTSA vPIC decode: structure, powertrain, plant, safety
            equipment, and recalls. Use the chassis VIN on motorhomes (door jamb
            / title).
          </p>

          {error ? (
            <p className="rounded-[var(--radius-md)] border border-ruby-border bg-ruby-soft px-3 py-2 text-[13px] text-ruby">
              {error}
            </p>
          ) : null}

          <details className="rounded-[var(--radius-md)] border border-white/15 bg-black/30 p-3">
            <summary className="cursor-pointer text-[12px] font-bold text-sky-200">
              Test barcode (scanner practice)
            </summary>
            <div className="mt-2 space-y-2">
              <p className="text-[11px] leading-relaxed text-white/80">
                Sample VIN{" "}
                <span className="font-mono font-bold text-white">
                  1FTFW1ET5DFC10312
                </span>
                . Open full-screen on another device, then Scan.
              </p>
              <img
                src="/assets/sample-vin-barcode.png"
                alt="Sample VIN barcodes CODE 128 CODE 39 and QR"
                className="w-full rounded-lg border border-white/15 bg-white"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setVin("1FTFW1ET5DFC10312");
                    setError(null);
                    inputRef.current?.focus();
                  }}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white"
                >
                  Fill sample VIN
                </button>
                <a
                  href="/sample/vin-barcode.html"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-sky-400/40 bg-sky-500/15 px-3 py-1.5 text-[11px] font-bold text-sky-100"
                >
                  Open full-screen poster
                </a>
              </div>
            </div>
          </details>

          {result ? (
            <div className="space-y-3">
              {/* Identity hero */}
              <div className="glass-prestige rounded-[var(--radius-xl)] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-semibold text-blue">
                      {result.year}
                    </p>
                    <h3 className="text-[20px] font-bold leading-tight text-white">
                      {result.make} {result.model}
                    </h3>
                    {result.trim !== "—" || result.series !== "—" ? (
                      <p className="mt-0.5 text-[12px] text-white/90">
                        {[result.series, result.trim]
                          .filter((x) => x && x !== "—")
                          .join(" · ")}
                      </p>
                    ) : null}
                  </div>
                  {result.recallCount > 0 ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ruby px-2.5 py-1 text-[11px] font-bold text-white">
                      <AlertTriangle className="size-3" />
                      {result.recallCount} Recalls
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-green/40 bg-green/15 px-2.5 py-1 text-[11px] font-bold text-green">
                      <CheckCircle2 className="size-3" />
                      No recalls
                    </span>
                  )}
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="glass-chip rounded-full px-2.5 py-1 text-[11px] font-semibold text-white">
                    {result.bodyClass}
                  </span>
                  <span className="glass-chip rounded-full px-2.5 py-1 text-[11px] font-semibold text-white">
                    {result.vehicleType}
                  </span>
                  {result.verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-green/40 bg-green/15 px-2.5 py-1 text-[11px] font-bold text-green">
                      <CheckCircle2 className="size-3" />
                      NHTSA Verified
                    </span>
                  ) : null}
                  {s?.checkDigitValid === true ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-green/40 bg-green/15 px-2.5 py-1 text-[11px] font-bold text-green">
                      <Shield className="size-3" />
                      Check digit OK
                    </span>
                  ) : s?.checkDigitValid === false ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber/50 bg-amber/15 px-2.5 py-1 text-[11px] font-bold text-amber">
                      <AlertTriangle className="size-3" />
                      Check digit fail
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 rounded-[var(--radius-md)] border border-white/10 bg-black/25 px-3 py-2 font-mono text-[12px] tracking-wide text-white">
                  <span className="mr-2 font-bold text-blue">VIN</span>
                  {result.vin}
                </p>
                {result.errorText &&
                result.errorCode &&
                result.errorCode !== "0" ? (
                  <p className="mt-2 text-[11px] leading-relaxed text-amber">
                    NHTSA note: {result.errorText}
                  </p>
                ) : null}
                {result.additionalErrorText ? (
                  <p className="mt-1 text-[11px] leading-relaxed text-white/70">
                    {result.additionalErrorText}
                  </p>
                ) : null}
              </div>

              {/* VIN structure */}
              {s ? (
                <div className="space-y-2">
                  <SectionTitle>VIN STRUCTURE · ISO 3779</SectionTitle>
                  <div className="grid grid-cols-2 gap-2">
                    <DetailTile label="WMI (1–3)" value={s.wmi} accent />
                    <DetailTile label="VDS (4–8)" value={s.vds} accent />
                    <DetailTile
                      label="Check digit (9)"
                      value={
                        s.checkDigitValid === true
                          ? `${s.checkDigit} · valid`
                          : s.checkDigitValid === false
                            ? `${s.checkDigit} · invalid`
                            : s.checkDigit
                      }
                      accent={s.checkDigitValid === true}
                    />
                    <DetailTile
                      label="Model year code (10)"
                      value={
                        s.modelYearHint
                          ? `${s.modelYearCode} · ~${s.modelYearHint}`
                          : s.modelYearCode
                      }
                    />
                    <DetailTile label="Plant code (11)" value={s.plantCode} />
                    <DetailTile label="Serial (12–17)" value={s.serial} />
                    <DetailTile
                      label="VIS (10–17)"
                      value={s.vis}
                      full
                    />
                    <DetailTile
                      label="Vehicle descriptor"
                      value={result.vehicleDescriptor || s.vehicleDescriptor}
                      full
                      accent
                    />
                  </div>

                  {/* Visual position strip */}
                  <div className="rounded-[var(--radius-md)] border border-white/12 bg-black/30 p-3">
                    <p className="mb-2 text-[10px] font-bold tracking-wide text-white/70">
                      POSITION MAP
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {s.positions.map((p) => {
                        const zone =
                          p.pos <= 3
                            ? "wmi"
                            : p.pos <= 8
                              ? "vds"
                              : p.pos === 9
                                ? "chk"
                                : p.pos === 10
                                  ? "yr"
                                  : p.pos === 11
                                    ? "plt"
                                    : "ser";
                        const tone =
                          zone === "wmi"
                            ? "border-sky-400/50 bg-sky-500/20 text-sky-100"
                            : zone === "vds"
                              ? "border-blue/40 bg-blue/15 text-white"
                              : zone === "chk"
                                ? s.checkDigitValid === false
                                  ? "border-amber/50 bg-amber/20 text-amber"
                                  : "border-emerald-400/45 bg-emerald-500/15 text-emerald-100"
                                : zone === "yr"
                                  ? "border-gold/45 bg-gold/15 text-gold-bright"
                                  : zone === "plt"
                                    ? "border-white/25 bg-white/10 text-white"
                                    : "border-white/15 bg-black/30 text-white/90";
                        return (
                          <div
                            key={p.pos}
                            title={`Pos ${p.pos}: ${p.role}`}
                            className={cn(
                              "flex w-7 flex-col items-center rounded border py-1 font-mono",
                              tone,
                            )}
                          >
                            <span className="text-[8px] opacity-70">{p.pos}</span>
                            <span className="text-[13px] font-bold leading-none">
                              {p.char}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[9px] font-semibold text-white/60">
                      <span className="text-sky-200">WMI</span>
                      <span>VDS</span>
                      <span className="text-emerald-200">Check</span>
                      <span className="text-gold-bright">Year</span>
                      <span>Plant</span>
                      <span>Serial</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPositions((v) => !v)}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-sky-200"
                    >
                      <ChevronDown
                        className={cn(
                          "size-3.5 transition",
                          showPositions && "rotate-180",
                        )}
                      />
                      {showPositions ? "Hide" : "Show"} position legend
                    </button>
                    {showPositions ? (
                      <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-[11px] text-white/80">
                        {s.positions.map((p) => (
                          <li key={p.pos} className="flex gap-2">
                            <span className="w-10 shrink-0 font-mono font-bold text-sky-200">
                              {p.pos}. {p.char}
                            </span>
                            <span>{p.role}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Identity / manufacturer */}
              <div className="space-y-2">
                <SectionTitle>IDENTITY & MANUFACTURER</SectionTitle>
                <div className="grid grid-cols-2 gap-2">
                  <DetailTile label="Manufacturer" value={result.manufacturer} full accent />
                  <DetailTile label="Make" value={result.make} />
                  <DetailTile label="Model" value={result.model} />
                  <DetailTile label="Model year" value={result.year} />
                  <DetailTile label="Series" value={result.series} />
                  <DetailTile label="Trim" value={result.trim} />
                  <DetailTile label="Body class" value={result.bodyClass} />
                  <DetailTile label="Cab / body type" value={result.bodyCabType} />
                  <DetailTile label="Vehicle type" value={result.vehicleType} />
                  <DetailTile label="Doors" value={result.doors} />
                  <DetailTile label="GVWR" value={result.gvwr} accent />
                  <DetailTile label="Assembly plant" value={result.assembly} full />
                </div>
              </div>

              {/* Powertrain */}
              <div className="space-y-2">
                <SectionTitle>POWERTRAIN</SectionTitle>
                <div className="grid grid-cols-2 gap-2">
                  <DetailTile label="Engine summary" value={result.engine} full accent />
                  <DetailTile label="Engine model" value={result.engineModel} />
                  <DetailTile label="Engine mfr" value={result.engineManufacturer} />
                  <DetailTile label="Configuration" value={result.engineConfiguration} />
                  <DetailTile label="Displacement (L)" value={result.displacementL} />
                  <DetailTile label="Displacement (ci)" value={result.displacementCi} />
                  <DetailTile label="Cylinders" value={result.cylinders} />
                  <DetailTile label="Horsepower" value={result.horsepower} accent />
                  <DetailTile label="Fuel primary" value={result.fuel} accent />
                  <DetailTile label="Fuel secondary" value={result.fuelSecondary} />
                  <DetailTile label="Injection" value={result.fuelInjection} full />
                  <DetailTile label="Drive type" value={result.driveType} />
                  <DetailTile label="Transmission" value={result.transmission} />
                  <DetailTile label="Electrification" value={result.electrification} />
                  <DetailTile label="Battery type" value={result.batteryType} />
                </div>
              </div>

              {/* Safety */}
              <div className="space-y-2">
                <SectionTitle>SAFETY & EQUIPMENT</SectionTitle>
                <div className="grid grid-cols-2 gap-2">
                  <DetailTile label="Airbags (front)" value={result.airBagFront} />
                  <DetailTile label="Airbags (side)" value={result.airBagSide} />
                  <DetailTile label="Airbags (curtain)" value={result.airBagCurtain} />
                  <DetailTile label="Seat belts" value={result.seatBelts} />
                  <DetailTile label="TPMS" value={result.tpms} />
                  <DetailTile label="Brake system" value={result.brakeSystem} />
                  <DetailTile label="ABS" value={result.abs} />
                </div>
              </div>

              {/* Extra NHTSA fields */}
              {result.extra?.length ? (
                <div className="space-y-2">
                  <SectionTitle>ADDITIONAL NHTSA FIELDS</SectionTitle>
                  <div className="grid grid-cols-2 gap-2">
                    {result.extra.map((row) => (
                      <DetailTile
                        key={row.label}
                        label={row.label}
                        value={row.value}
                        full={row.value.length > 28}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Recalls */}
              <div className="rounded-[var(--radius-lg)] border border-white/10 bg-black/25 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold tracking-[0.08em] text-white">
                    NHTSA RECALLS
                  </p>
                  <a
                    href="https://www.nhtsa.gov/recalls"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue"
                  >
                    nhtsa.gov <ExternalLink className="size-3" />
                  </a>
                </div>
                {result.recallCount === 0 ? (
                  <p className="mt-2 text-[13px] text-green">
                    No open recalls found for this year / make / model.
                  </p>
                ) : (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-[12px] font-semibold text-amber">
                      ⚠ {result.recallCount} campaign
                      {result.recallCount === 1 ? "" : "s"} on record
                    </p>
                    {result.recalls.map((r) => {
                      const openRow = expandedRecall === r.campaignNumber;
                      return (
                        <button
                          key={r.campaignNumber || r.component + r.reportDate}
                          type="button"
                          onClick={() =>
                            setExpandedRecall(openRow ? null : r.campaignNumber)
                          }
                          className="glass-field flex w-full flex-col rounded-[var(--radius-md)] px-3 py-2.5 text-left"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-[12px] font-bold text-white">
                                {r.component || "EQUIPMENT"}
                              </p>
                              <p className="text-[11px] text-white/80">
                                {r.campaignNumber}
                                {r.reportDate ? ` · ${r.reportDate}` : ""}
                              </p>
                            </div>
                            <span className="text-white">
                              {openRow ? "▾" : "›"}
                            </span>
                          </div>
                          {openRow ? (
                            <div className="mt-2 space-y-1.5 border-t border-white/10 pt-2 text-[11px] leading-relaxed text-white/90">
                              {r.summary ? <p>{r.summary}</p> : null}
                              {r.consequence ? (
                                <p>
                                  <span className="font-semibold text-amber">
                                    Risk:{" "}
                                  </span>
                                  {r.consequence}
                                </p>
                              ) : null}
                              {r.remedy ? (
                                <p>
                                  <span className="font-semibold text-green">
                                    Remedy:{" "}
                                  </span>
                                  {r.remedy}
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <p className="text-center text-[10px] leading-relaxed text-white/75">
                Data from NHTSA vPIC DecodeVinValuesExtended & Recalls APIs.
                Motorhomes: decode the chassis VIN; coach floorplan is not
                encoded in the VIN. Confirm door sticker & PPI.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {scanning ? (
        <Suspense fallback={null}>
          <VinScanner
            open={scanning}
            onClose={() => setScanning(false)}
            onDetected={onScanned}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
