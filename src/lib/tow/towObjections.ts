/**
 * Lot-desk weight objections from real Facts + truck numbers.
 * GAP when a number is missing — never invent OEM ratings or insurance.
 */

import {
  hitchLoadLbs,
  recommendedPayloadLbs,
  recommendedTowLbs,
} from "./towReverse.ts";
import {
  estimateCombinedLbs,
  hitchFractionForKind,
  hitchKindForRvType,
  type HitchKind,
} from "./towMatch.ts";

export type TowObjectionId = "tow" | "hitch" | "combo";

export type TowObjectionLine = {
  id: TowObjectionId;
  q: string;
  a: string;
  gap: boolean;
};

export type TowObjectionInput = {
  gvwrLbs?: number;
  rvType?: string;
  /** Typed pin or tongue. Blank → hitch-fraction estimate. */
  hitchLbs?: number;
  maxTow?: number;
  payload?: number;
  gcwr?: number;
};

function lbs(n?: number): number {
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n);
}

function fmt(n: number): string {
  return n.toLocaleString();
}

function hitchWord(kind: HitchKind): "pin" | "tongue" {
  return kind === "pin" ? "pin" : "tongue";
}

/**
 * Short salesman Q→A from numbers we already have.
 * Typical: too-heavy, pin/tongue, payload/GCWR. Insurance is out of scope.
 */
export function buildTowObjections(input: TowObjectionInput): TowObjectionLine[] {
  const gvwr = lbs(input.gvwrLbs);
  const hitchTyped = lbs(input.hitchLbs);
  const maxTow = lbs(input.maxTow);
  const payload = lbs(input.payload);
  const gcwr = lbs(input.gcwr);
  const kind = hitchKindForRvType(input.rvType ?? "");
  const word = hitchWord(kind);
  const fracPct = Math.round(hitchFractionForKind(kind) * 100);
  const hitchLoad = hitchLoadLbs({
    rvType: input.rvType ?? "",
    gvwrLbs: gvwr,
    hitchLbs: hitchTyped || undefined,
  });

  const lines: TowObjectionLine[] = [];

  if (!gvwr) {
    lines.push({
      id: "tow",
      q: "Too heavy for my truck?",
      a: "GAP — need trailer GVWR.",
      gap: true,
    });
  } else if (!maxTow) {
    lines.push({
      id: "tow",
      q: "Too heavy for my truck?",
      a: "GAP — need truck max tow.",
      gap: true,
    });
  } else {
    const rec = recommendedTowLbs(maxTow);
    const over = gvwr > maxTow;
    const thin = rec > 0 && gvwr > rec && gvwr <= maxTow;
    lines.push({
      id: "tow",
      q: "Too heavy for my truck?",
      a: over
        ? `${fmt(gvwr)} lb GVWR exceeds ${fmt(maxTow)} max tow.`
        : thin
          ? `${fmt(gvwr)} lb GVWR under ${fmt(maxTow)} max, over ${fmt(rec)} rec (80%).`
          : `${fmt(gvwr)} lb GVWR vs ${fmt(maxTow)} max / ${fmt(rec)} rec — under max.`,
      gap: false,
    });
  }

  if (!gvwr && !hitchTyped) {
    lines.push({
      id: "hitch",
      q: `What's ${word}?`,
      a: `GAP — need GVWR to estimate ${word}.`,
      gap: true,
    });
  } else {
    lines.push({
      id: "hitch",
      q: `What's ${word}?`,
      a: hitchTyped
        ? `Typed ${word} ${fmt(hitchLoad)} lbs.`
        : `Est. ${word} ${fmt(hitchLoad)} lbs (${fracPct}% of GVWR).`,
      gap: false,
    });
  }

  if (payload || gcwr) {
    const bits: string[] = [];
    let gap = false;
    if (payload) {
      if (!hitchLoad) {
        bits.push("GAP — need GVWR or typed hitch for payload.");
        gap = true;
      } else {
        const rec = recommendedPayloadLbs(payload);
        const prefix = hitchTyped ? "" : "Est. ";
        if (hitchLoad > payload) {
          bits.push(
            `${prefix}${word} ${fmt(hitchLoad)} exceeds ${fmt(payload)} lb payload.`,
          );
        } else if (rec > 0 && hitchLoad > rec) {
          bits.push(
            `${prefix}${word} ${fmt(hitchLoad)} vs ${fmt(payload)} payload — over ${fmt(rec)} rec (85%).`,
          );
        } else {
          bits.push(
            `${prefix}${word} ${fmt(hitchLoad)} vs ${fmt(payload)} payload${
              rec ? ` / ${fmt(rec)} rec` : ""
            }.`,
          );
        }
      }
    }
    if (gcwr) {
      if (!gvwr) {
        bits.push("GAP — need trailer GVWR for combo.");
        gap = true;
      } else {
        const combined = estimateCombinedLbs({
          gcwr,
          maxTow,
          gvwrLbs: gvwr,
        });
        if (!combined) {
          bits.push("GAP — need trailer GVWR for combo.");
          gap = true;
        } else if (
          combined.combinedLbs > combined.gcwr ||
          gvwr > combined.gcwr
        ) {
          bits.push(
            `Est. combo ${fmt(combined.combinedLbs)} exceeds ${fmt(combined.gcwr)} GCWR.`,
          );
        } else {
          bits.push(
            `Est. combo ${fmt(combined.combinedLbs)} ≤ ${fmt(combined.gcwr)} GCWR.`,
          );
        }
      }
    }
    lines.push({
      id: "combo",
      q: "Payload / GCWR?",
      a: bits.join(" "),
      gap,
    });
  }

  return lines.slice(0, 4);
}
