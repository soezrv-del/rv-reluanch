import { useMemo, useState } from "react";
import { ArrowUpLeft, Search, X } from "lucide-react";
import { MAKES, RV_DATA } from "@/lib/rv/catalog";
import { cn } from "@/lib/utils";

export type ManualSel = {
  year: string;
  make: string;
  model: string;
  floorplan: string;
};

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="font-bold text-inherit">{text.slice(i, i + q.length)}</span>
      {text.slice(i + q.length)}
    </>
  );
}

export function SearchManual({
  onSearch,
  searching,
}: {
  onSearch: (sel: ManualSel) => void;
  searching?: boolean;
}) {
  const [manYear, setManYear] = useState("");
  const [manMake, setManMake] = useState("");
  const [manModel, setManModel] = useState("");
  const [manFloorplan, setManFloorplan] = useState("");
  const [showMake, setShowMake] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [showFp, setShowFp] = useState(false);

  const makeSuggestions = useMemo(() => {
    const q = manMake.trim().toLowerCase();
    if (!q) return MAKES.slice(0, 8);
    return MAKES.filter((m) => m.toLowerCase().includes(q)).slice(0, 8);
  }, [manMake]);

  const modelSuggestions = useMemo(() => {
    const mkQuery = manMake.trim().toLowerCase();
    const matchingMakes = mkQuery
      ? MAKES.filter((m) => m.toLowerCase().includes(mkQuery))
      : MAKES;
    const allModels: string[] = [];
    const seen = new Set<string>();
    for (const mk of matchingMakes) {
      for (const mdl of Object.keys(RV_DATA[mk] ?? {})) {
        if (seen.has(mdl)) continue;
        seen.add(mdl);
        allModels.push(mdl);
      }
    }
    allModels.sort((a, b) => a.localeCompare(b));
    const mq = manModel.trim().toLowerCase();
    if (!mq) return allModels.slice(0, 8);
    return allModels.filter((m) => m.toLowerCase().includes(mq)).slice(0, 8);
  }, [manMake, manModel]);

  const floorplanSuggestions = useMemo(() => {
    const mkQuery = manMake.trim().toLowerCase();
    const mdlQuery = manModel.trim().toLowerCase();
    if (!mkQuery && !mdlQuery) return [];
    const matchingMake =
      MAKES.find((m) => m.toLowerCase() === mkQuery) ??
      MAKES.find((m) => mkQuery && m.toLowerCase().includes(mkQuery));
    if (!matchingMake) return [];
    const models = Object.keys(RV_DATA[matchingMake] ?? {});
    const matchingModel =
      models.find((m) => m.toLowerCase() === mdlQuery) ??
      models.find((m) => mdlQuery && m.toLowerCase().includes(mdlQuery));
    if (!matchingModel) return [];
    const fps = RV_DATA[matchingMake]?.[matchingModel]?.floorplans ?? [];
    const fq = manFloorplan.trim().toLowerCase();
    if (!fq) return fps.slice(0, 12);
    return fps.filter((fp) => fp.toLowerCase().includes(fq)).slice(0, 12);
  }, [manMake, manModel, manFloorplan]);

  const ownerMakeFor = (mdl: string) => {
    const mkQuery = manMake.trim().toLowerCase();
    return (
      MAKES.find((m) => m.toLowerCase().includes(mkQuery) && RV_DATA[m]?.[mdl]) ??
      MAKES.find((m) => RV_DATA[m]?.[mdl])
    );
  };

  const modelType = (mdl: string) => {
    const mk = ownerMakeFor(mdl);
    return mk ? (RV_DATA[mk]?.[mdl]?.type ?? "") : "";
  };

  const ready = manMake.trim().length > 0 || manModel.trim().length > 0;

  const submit = () => {
    if (!ready) return;
    let make = manMake.trim();
    const model = manModel.trim();
    if (!make && model) make = ownerMakeFor(model) ?? "";
    onSearch({
      year: manYear.trim(),
      make,
      model,
      floorplan: manFloorplan.trim(),
    });
  };

  const clear = () => {
    setManYear("");
    setManMake("");
    setManModel("");
    setManFloorplan("");
    setShowMake(false);
    setShowModel(false);
    setShowFp(false);
  };

  return (
    <div className="space-y-2.5" data-no-pull-reset>
      <p className="text-[13px] leading-snug text-white">
        Type any year, make, model, or floorplan — works for any RV brand
      </p>

      <div className="flex gap-2">
        <label className="flex-[0.85] space-y-1">
          <span className="block text-[11px] font-bold tracking-[0.12em] text-white">
            YEAR
          </span>
          <input
            value={manYear}
            onChange={(e) => setManYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
            onFocus={() => {
              setShowMake(false);
              setShowModel(false);
              setShowFp(false);
            }}
            inputMode="numeric"
            maxLength={4}
            placeholder="e.g. 2024"
            className="glass-field w-full rounded-[var(--radius-md)] px-3 py-3 text-[15px] font-medium text-white outline-none placeholder:text-white/40"
          />
        </label>

        <div className="relative flex-[1.6] space-y-1">
          <span className="block text-[11px] font-bold tracking-[0.12em] text-white">
            MAKE
          </span>
          <input
            value={manMake}
            onChange={(e) => {
              const t = e.target.value;
              if (t !== manMake) {
                setManModel("");
                setManFloorplan("");
              }
              setManMake(t);
              setShowMake(true);
              setShowModel(false);
              setShowFp(false);
            }}
            onFocus={() => {
              setShowMake(true);
              setShowModel(false);
              setShowFp(false);
            }}
            onBlur={() => window.setTimeout(() => setShowMake(false), 180)}
            autoCorrect="off"
            autoCapitalize="words"
            placeholder="e.g. Entegra Coach"
            className={cn(
              "glass-field w-full rounded-[var(--radius-md)] px-3 py-3 text-[15px] font-medium text-white outline-none placeholder:text-white/40",
              showMake && makeSuggestions.length > 0 && "rounded-b-none border-blue/50",
            )}
          />
          {showMake && makeSuggestions.length > 0 ? (
            <ul className="absolute left-0 right-0 top-full z-30 overflow-hidden rounded-b-[var(--radius-md)] border border-t-0 border-blue/40 bg-[#0D1F3C] shadow-xl">
              {makeSuggestions.map((brand, idx) => (
                <li key={brand}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2.5 text-left text-[13px] text-white/85 active:bg-blue/20",
                      idx < makeSuggestions.length - 1 && "border-b border-blue/15",
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (brand !== manMake) {
                        setManModel("");
                        setManFloorplan("");
                      }
                      setManMake(brand);
                      setShowMake(false);
                    }}
                  >
                    <span className="min-w-0 truncate">
                      <Highlight text={brand} query={manMake} />
                    </span>
                    <ArrowUpLeft className="size-3 shrink-0 text-white/40" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="relative space-y-1">
        <span className="block text-[10px] font-bold tracking-[0.12em] text-white/50">
          MODEL
        </span>
        <input
          value={manModel}
          onChange={(e) => {
            setManModel(e.target.value);
            setShowModel(true);
            setShowMake(false);
            setShowFp(false);
          }}
          onFocus={() => {
            setShowModel(true);
            setShowMake(false);
            setShowFp(false);
          }}
          onBlur={() => window.setTimeout(() => setShowModel(false), 180)}
          autoCorrect="off"
          autoCapitalize="words"
          placeholder="e.g. Anthem, Accolade, Dutch Star…"
          className={cn(
            "glass-field w-full rounded-[var(--radius-md)] px-3 py-3 text-[15px] font-medium text-white outline-none placeholder:text-white/40",
            showModel &&
              modelSuggestions.length > 0 &&
              "rounded-b-none border-gold-border/60",
          )}
        />
        {showModel && modelSuggestions.length > 0 ? (
          <ul className="absolute left-0 right-0 top-full z-30 max-h-56 overflow-y-auto rounded-b-[var(--radius-md)] border border-t-0 border-gold-border/40 bg-[#1A1500] shadow-xl">
            {modelSuggestions.map((mdl, idx) => {
              const rvType = modelType(mdl);
              return (
                <li key={`${mdl}-${idx}`}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-white/85 active:bg-gold-dim/20",
                      idx < modelSuggestions.length - 1 &&
                        "border-b border-white/10",
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setManModel(mdl);
                      const owner = ownerMakeFor(mdl);
                      if (owner && owner !== manMake) setManMake(owner);
                      setShowModel(false);
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      <Highlight text={mdl} query={manModel} />
                    </span>
                    {rvType ? (
                      <span className="max-w-[90px] shrink-0 truncate text-[9px] font-medium text-gold/70">
                        {rvType}
                      </span>
                    ) : null}
                    <ArrowUpLeft className="size-3 shrink-0 text-white/40" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <div className="relative space-y-1">
        <span className="block text-[10px] font-bold tracking-[0.12em] text-white/50">
          FLOORPLAN{" "}
          <span className="font-normal tracking-wide text-white/40">OPTIONAL</span>
        </span>
        <input
          value={manFloorplan}
          onChange={(e) => {
            setManFloorplan(e.target.value);
            setShowFp(true);
            setShowMake(false);
            setShowModel(false);
          }}
          onFocus={() => {
            setShowFp(true);
            setShowMake(false);
            setShowModel(false);
          }}
          onBlur={() => window.setTimeout(() => setShowFp(false), 180)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          autoCorrect="off"
          autoCapitalize="characters"
          placeholder="e.g. 44B, 37TS, 45OPP…"
          className={cn(
            "glass-field w-full rounded-[var(--radius-md)] px-3 py-3 text-[15px] font-medium text-white outline-none placeholder:text-white/40",
            showFp &&
              floorplanSuggestions.length > 0 &&
              "rounded-b-none border-emerald-400/50",
          )}
        />
        {showFp && floorplanSuggestions.length > 0 ? (
          <ul className="absolute left-0 right-0 top-full z-30 max-h-52 overflow-y-auto rounded-b-[var(--radius-md)] border border-t-0 border-emerald-500/40 bg-[#001A0D] shadow-xl">
            {floorplanSuggestions.map((fp, idx) => (
              <li key={`${fp}-${idx}`}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2.5 text-left text-[13px] text-white/85 active:bg-emerald-500/15",
                    idx < floorplanSuggestions.length - 1 &&
                      "border-b border-emerald-500/15",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setManFloorplan(fp);
                    setShowFp(false);
                  }}
                >
                  <span className="min-w-0 truncate">
                    <Highlight text={fp} query={manFloorplan} />
                  </span>
                  <ArrowUpLeft className="size-3 shrink-0 text-white/40" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <button
        type="button"
        disabled={!ready || searching}
        onClick={submit}
        className={cn(
          "flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-md)] text-[15px] font-bold active:scale-[0.98]",
          ready
            ? "bg-[#FF6B35] text-white shadow-[0_6px_18px_rgba(255,107,53,0.4)]"
            : "border border-white/10 bg-white/5 text-white/40",
        )}
      >
        {searching ? (
          "Searching…"
        ) : (
          <>
            <Search className="size-4" />
            Search
          </>
        )}
      </button>

      {manYear || manMake || manModel || manFloorplan ? (
        <button
          type="button"
          onClick={clear}
          className="mx-auto flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-white/45"
        >
          <X className="size-3" />
          Clear all
        </button>
      ) : null}
    </div>
  );
}
