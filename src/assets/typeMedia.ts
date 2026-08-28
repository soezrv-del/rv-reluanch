import typeFifthWheel from "@/assets/backdrops/rv-type-fifth-wheel.jpg";
import typeTravelTrailer from "@/assets/backdrops/rv-type-travel-trailer.jpg";
import typeClassC from "@/assets/backdrops/rv-type-class-c.jpg";
import typeClassB from "@/assets/backdrops/rv-type-class-b.jpg";
import typeClassA from "@/assets/backdrops/rv-type-class-a.jpg";

/** Fallback card media when type unknown */
export const RV_CARD_MEDIA = typeClassA;

export const RV_TYPE_MEDIA = {
  fifthWheel: typeFifthWheel,
  travelTrailer: typeTravelTrailer,
  classC: typeClassC,
  classB: typeClassB,
  classA: typeClassA,
} as const;

export function mediaForRvType(type?: string | null): string {
  const t = (type || "").toLowerCase();
  if (!t) return RV_CARD_MEDIA;

  if (/fifth\s*wheel|5th\s*wheel|fiver/.test(t)) {
    return RV_TYPE_MEDIA.fifthWheel;
  }
  if (/toy\s*hauler/.test(t)) {
    return RV_TYPE_MEDIA.fifthWheel;
  }
  if (/travel\s*trailer|trailer|towable/.test(t) && !/motor/.test(t)) {
    return RV_TYPE_MEDIA.travelTrailer;
  }
  if (/class\s*b\+?|class b|van\b|sprinter\s*van|camper\s*van/.test(t)) {
    return RV_TYPE_MEDIA.classB;
  }
  if (/super\s*c|class\s*c/.test(t)) {
    return RV_TYPE_MEDIA.classC;
  }
  if (/class\s*a|diesel\s*pusher|motor\s*home|motorhome/.test(t)) {
    return RV_TYPE_MEDIA.classA;
  }
  if (/diesel|gas/.test(t) && /class/.test(t)) {
    return RV_TYPE_MEDIA.classA;
  }
  return RV_CARD_MEDIA;
}

export function resolveCardImage(spec: {
  type?: string;
  image?: string | null;
}): string {
  return mediaForRvType(spec.type) || spec.image || RV_CARD_MEDIA;
}
