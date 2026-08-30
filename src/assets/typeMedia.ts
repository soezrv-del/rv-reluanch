/** Lifestyle stills by RV class — public URLs so Share can attach the same file. */

const LIFESTYLE = {
  fifthWheel: "/assets/lifestyle/fifth-wheel.jpg",
  travelTrailer: "/assets/lifestyle/travel-trailer.jpg",
  toyHauler: "/assets/lifestyle/toy-hauler.jpg",
  classC: "/assets/lifestyle/class-c.jpg",
  superC: "/assets/lifestyle/super-c.jpg",
  classB: "/assets/lifestyle/class-b.jpg",
  classADiesel: "/assets/lifestyle/class-a-diesel.jpg",
  classAGas: "/assets/lifestyle/class-a-gas.jpg",
} as const;

/** Fallback card media when type unknown */
export const RV_CARD_MEDIA = LIFESTYLE.classADiesel;

export const RV_TYPE_MEDIA = {
  fifthWheel: LIFESTYLE.fifthWheel,
  travelTrailer: LIFESTYLE.travelTrailer,
  toyHauler: LIFESTYLE.toyHauler,
  classC: LIFESTYLE.classC,
  superC: LIFESTYLE.superC,
  classB: LIFESTYLE.classB,
  classADiesel: LIFESTYLE.classADiesel,
  classAGas: LIFESTYLE.classAGas,
  classA: LIFESTYLE.classADiesel,
} as const;

function classAIsGas(type: string, fuel?: string | null): boolean {
  const blob = `${type} ${fuel || ""}`.toLowerCase();
  if (/diesel/.test(type) || /diesel\s*pusher/.test(blob)) return false;
  return /gas/.test(blob) || /gas\s*pusher/.test(blob);
}

export function mediaForRvType(
  type?: string | null,
  fuelType?: string | null,
  chassis?: string | null,
): string {
  const t = (type || "").toLowerCase();
  const ch = (chassis || "").toLowerCase();
  if (!t && !ch) return RV_CARD_MEDIA;

  if (/toy\s*hauler/.test(t)) return RV_TYPE_MEDIA.toyHauler;
  if (/fifth\s*wheel|5th\s*wheel|fiver|\bfifth\b/.test(t)) {
    return RV_TYPE_MEDIA.fifthWheel;
  }
  if (/travel\s*trailer|trailer|towable/.test(t) && !/motor/.test(t)) {
    return RV_TYPE_MEDIA.travelTrailer;
  }
  if (/class\s*b\+?|class b|van\b|sprinter\s*van|camper\s*van/.test(t)) {
    return RV_TYPE_MEDIA.classB;
  }
  const superCChassis = /f-?550|f-?600|cascadia|\bm2\b/.test(ch);
  if (/super\s*c/.test(t) || (superCChassis && !/class\s*a/.test(t))) {
    return RV_TYPE_MEDIA.superC;
  }
  if (/class\s*c/.test(t)) return RV_TYPE_MEDIA.classC;
  if (/class\s*a|diesel\s*pusher|gas\s*pusher|motor\s*home|motorhome/.test(t)) {
    return classAIsGas(t, fuelType)
      ? RV_TYPE_MEDIA.classAGas
      : RV_TYPE_MEDIA.classADiesel;
  }
  if (/diesel|gas/.test(t) && /class/.test(t)) {
    return classAIsGas(t, fuelType)
      ? RV_TYPE_MEDIA.classAGas
      : RV_TYPE_MEDIA.classADiesel;
  }
  return RV_CARD_MEDIA;
}

export function resolveCardImage(spec: {
  type?: string;
  image?: string | null;
  fuelType?: string | null;
  chassis?: string | null;
}): string {
  return (
    mediaForRvType(spec.type, spec.fuelType, spec.chassis) ||
    spec.image ||
    RV_CARD_MEDIA
  );
}
