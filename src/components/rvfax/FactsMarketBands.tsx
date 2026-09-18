import { cn } from "@/lib/utils";
import {
  factsMarketBandSlots,
  MARKET_BAND_AVERAGE_LABEL,
  MARKET_BAND_HIGH_LABEL,
  MARKET_BAND_LOW_LABEL,
  THIN_SAMPLE_FLAG_LABEL,
} from "@/lib/rv/factsMarketBands";

/**
 * Facts Market value Low / Average / High trio.
 * Parent supplies already-formatted MarketEstimate fields — no new math.
 */
export function FactsMarketBands({
  retailLow,
  average,
  retailHigh,
  hideRetailHigh,
  confidence,
  soldSampleSize,
  sampleSize,
  thinSampleMessage,
  averageCaption,
  tradeIn,
}: {
  retailLow: string;
  average: string;
  retailHigh: string;
  hideRetailHigh: boolean;
  confidence?: "high" | "medium" | "low";
  soldSampleSize?: number;
  sampleSize?: number;
  thinSampleMessage: string;
  /** Average source cue — blend / Catalog estimate / never a paid book brand. */
  averageCaption?: string;
  tradeIn?: string;
}) {
  const slots = factsMarketBandSlots({
    retailLow,
    average,
    retailHigh,
    hideRetailHigh,
    confidence,
    soldSampleSize,
    sampleSize,
    thinSampleMessage,
  });

  return (
    <div data-facts-market-bands>
      <div className="grid grid-cols-3 gap-2">
        <BandTile label={slots.low.label} value={slots.low.value} />
        <BandTile
          label={slots.average.label}
          value={slots.average.value}
          caption={averageCaption}
          accent
          captionAttr
        />
        {slots.high ? (
          <BandTile label={slots.high.label} value={slots.high.value} />
        ) : slots.thinSample ? (
          <ThinSampleFlag
            label={slots.thinSample.label}
            message={slots.thinSample.message}
          />
        ) : null}
      </div>
      {slots.high && slots.thinSample ? (
        <div className="mt-2">
          <ThinSampleFlag
            label={slots.thinSample.label}
            message={slots.thinSample.message}
          />
        </div>
      ) : null}
      {tradeIn ? (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <BandTile label="Trade-in" value={tradeIn} />
        </div>
      ) : null}
    </div>
  );
}

export {
  MARKET_BAND_AVERAGE_LABEL,
  MARKET_BAND_HIGH_LABEL,
  MARKET_BAND_LOW_LABEL,
  THIN_SAMPLE_FLAG_LABEL,
};

function BandTile({
  label,
  value,
  caption,
  accent,
  captionAttr,
}: {
  label: string;
  value: string;
  caption?: string;
  accent?: boolean;
  captionAttr?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 px-2 py-3 text-center">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-[14px] font-semibold tabular-nums leading-tight text-white",
          accent && "text-gold-bright",
        )}
      >
        {value}
      </p>
      {caption ? (
        <p
          data-average-caption={captionAttr ? caption : undefined}
          className="mt-1 text-[10px] font-semibold leading-snug text-white/70"
        >
          {caption}
        </p>
      ) : null}
    </div>
  );
}

function ThinSampleFlag({
  label,
  message,
}: {
  label: string;
  message: string;
}) {
  return (
    <div
      data-thin-sample
      className="rounded-2xl border border-ruby/40 bg-ruby/20 px-2 py-3 text-center"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white">
        {label}
      </p>
      <p className="mt-1 text-[11px] font-semibold leading-snug text-white">
        {message}
      </p>
    </div>
  );
}
