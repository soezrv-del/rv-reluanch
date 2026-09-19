/**
 * Published engine-variant torque (displacement + HP → OEM/Cummins/Ford lb-ft).
 *
 * SoT is existing dated pins in powertrainCorrections.ts. A key is listed
 * only when every published pin for that discrete variant agrees.
 * Conflicts (ISB 340 660/700/800, ISB 360 800/1000, ISL 380 1050/1150,
 * Power Stroke 330 750/825/950, OM642 188 260/325) stay GAP — never invent
 * and never stamp one rating on an option band (L9 450 / X15 605).
 * Power Stroke 300/750 is FLAG'd (no clean OEM) — do not backfill 750,
 * and do not guess 300/660 or 300/725 without a matching year/application.
 */

import {
  engineOmitsLoneTorque,
  extractOptionHpClasses,
} from "./catalogHonesty.ts";

type TorquePin = {
  engine: string;
  horsepower: number;
  torqueLbFt?: number;
  note?: string;
};

export type PublishedEngineTorque = {
  torqueLbFt: number;
  source: string;
};

/**
 * Canonical key: family + locked HP. Null when the engine string is not a
 * single published variant (mixed families, option band, or unnamed Cummins).
 */
export function engineVariantKey(
  engine: string | null | undefined,
  horsepower: number,
): string | null {
  if (!engine || !(horsepower > 0)) return null;
  if (engineOmitsLoneTorque(engine)) return null;
  if (extractOptionHpClasses(engine).length >= 2) return null;

  const e = engine.toLowerCase().replace(/\s+/g, " ").trim();
  const hp = Math.round(horsepower);

  const families = new Set<string>();
  if (/\b(x15|isx15|isx\s*15)\b/.test(e)) families.add("x15");
  if (/\bx12\b/.test(e)) families.add("x12");
  if (/\b(l9|isl9|isl\s*9)\b/.test(e) || (/\bisl\b/.test(e) && /\b8\.9\b/.test(e)))
    families.add("l9");
  else if (/\bisl\b/.test(e)) families.add("isl");
  if (/\b(isb|b6\.7)\b/.test(e)) families.add("isb");
  if (/\bisc\b/.test(e)) families.add("isc");
  if (/\bism\b/.test(e)) families.add("ism");
  if (/\bisx\s*11/.test(e)) families.add("isx-11.9");
  else if (/\bisx\b/.test(e) && !/\b(x15|isx15|isx\s*15)\b/.test(e))
    families.add("isx");
  if (families.size >= 2) return null;

  if (/\b(x15|isx15|isx\s*15)\b/.test(e)) return `cummins-x15|${hp}`;
  if (/\bx12\b/.test(e)) return `cummins-x12|${hp}`;
  if (/\b(l9|isl9|isl\s*9)\b/.test(e) || (/\bisl\b/.test(e) && /\b8\.9\b/.test(e)))
    return `cummins-l9|${hp}`;
  if (/\bcummins\s+l\b/.test(e)) return `cummins-l9|${hp}`;
  if (/\bisx\s*11/.test(e)) return `cummins-isx-11.9|${hp}`;
  if (/\bisx\b/.test(e)) return `cummins-isx|${hp}`;
  if (/\bisl\b/.test(e)) return `cummins-isl|${hp}`;
  if (/\b(isb|b6\.7)\b/.test(e)) return `cummins-isb|${hp}`;
  if (/\bisc\b/.test(e)) return `cummins-isc|${hp}`;
  if (/\bism\b/.test(e)) return `cummins-ism|${hp}`;
  if (/\bisv/.test(e)) return `cummins-isv|${hp}`;

  if (/5\.4/.test(e) && /ford|triton|e-?350/.test(e)) return `ford-5.4|${hp}`;
  if (/7\.3/.test(e)) return `ford-7.3|${hp}`;
  if (/6\.8/.test(e) || /\btriton\b/.test(e)) return `ford-6.8|${hp}`;
  if (/3\.5/.test(e) && /ecoboost|ford/.test(e)) return `ford-3.5-eco|${hp}`;
  if (/power\s*stroke/.test(e) && /6\.7/.test(e)) return `ford-ps-6.7|${hp}`;
  if (/3\.2/.test(e) && /ford|power\s*stroke|transit/.test(e))
    return `ford-3.2|${hp}`;

  if (/(mercedes|sprinter)/.test(e) && /2\.0|i4|i-4/.test(e))
    return `mb-2.0|${hp}`;
  if (/(mercedes|sprinter)/.test(e) && /3\.0|v6|om642/.test(e))
    return `mb-3.0|${hp}`;

  if (/\bdd13\b/.test(e)) return `detroit-dd13|${hp}`;
  if (/\bdd16\b/.test(e)) return `detroit-dd16|${hp}`;
  if (/\bdd8\b/.test(e)) return `detroit-dd8|${hp}`;

  if (/duramax/.test(e) || (/6\.6/.test(e) && /chevy|gm|vortec/.test(e)))
    return `gm-6.6|${hp}`;
  if (/6\.0/.test(e) && /chevy|gm|vortec/.test(e)) return `gm-6.0|${hp}`;
  if (/3\.6/.test(e) && /ram|pentastar|promaster/.test(e)) return `ram-3.6|${hp}`;
  if (/promaster/.test(e) && hp === 280) return `ram-promaster|${hp}`;
  if (/maxxforce/.test(e)) return `navistar-maxxforce7|${hp}`;

  return null;
}

/**
 * Discrete published ratings already cited on dated pins in
 * powertrainCorrections.ts. Do not add estimates or HP→torque formulas.
 */
export const ENGINE_TORQUE_BY_VARIANT: Record<string, PublishedEngineTorque> = {
  "cummins-isb|300": {
    torqueLbFt: 660,
    source: "Pace Arrow MY17–23 33D brochure: ISB 6.7 300 / 660",
  },
  "cummins-isb|350": {
    torqueLbFt: 750,
    source: "2010_di_pf Discovery: ISB 6.7 350 / 750",
  },
  "cummins-isb|380": {
    torqueLbFt: 1150,
    source: "OEM MY27VT Ventana 35–38': B6.7 380 / 1,150",
  },
  "cummins-isb|400": {
    torqueLbFt: 1250,
    source: "OEM MY27VT Ventana 40–43': B6.7 400 / 1,250",
  },
  "cummins-isc|330": {
    torqueLbFt: 1000,
    source: "OEM 2010 Embark Super C 10-EMBK-PL: ISC-330 / 1000",
  },
  "cummins-isc|350": {
    torqueLbFt: 1000,
    source: "OEM 2011 Embark Super C 11-EMBK-PL: ISC-350 / 1000",
  },
  "cummins-isc|360": {
    torqueLbFt: 1050,
    source: "OEM 2010_Phaeton: ISC 360 / 1,050",
  },
  "cummins-isc|380": {
    torqueLbFt: 1050,
    source: "OEM 2011_Phaeton / 2011_di_b: ISC 380 / 1,050",
  },
  "cummins-ism|500": {
    torqueLbFt: 1550,
    source: "OEM MY10 Cornerstone stds (Wayback 2010-12-25): ISM 10.8 500 / 1,550",
  },
  "cummins-isv|275": {
    torqueLbFt: 560,
    source: "OEM 2016_Allegro-Breeze: ISV5.0 275 / 560",
  },
  "cummins-isx-11.9|500": {
    torqueLbFt: 1645,
    source: "OEM 2013_Zephyr / 2014_Zephyr: ISX 11.9 500 / 1,645",
  },
  "cummins-isx|600": {
    torqueLbFt: 1950,
    source: "OEM MY13 Cornerstone stds: ISX 600 / 1,950",
  },
  "cummins-isx|605": {
    torqueLbFt: 1950,
    source: "OEM MY18 Cornerstone + JENT 5591-01: ISX 605 / 1,950",
  },
  "cummins-isl|400": {
    torqueLbFt: 1250,
    source: "OEM 2012_Phaeton 42 QBH / MY11 Aspire brochure: ISL 400 / 1,250",
  },
  "cummins-isl|425": {
    torqueLbFt: 1200,
    source: "OEM MY10 Anthem stds (Wayback 2010-12-25): ISL 425 / 1,200 @ 1300",
  },
  "cummins-isl|450": {
    torqueLbFt: 1250,
    source: "OEM MY12 Anthem 12-ATHM-PL / MY18 LXE 44H: ISL 450 / 1,250",
  },
  "cummins-isl|600": {
    torqueLbFt: 1950,
    source: "OEM 2017_Zephyr: ISL 600 / 1,950",
  },
  "cummins-l9|350": {
    torqueLbFt: 1000,
    source: "DX3 MY2016–2020 dated RVUSA/OEM: Cummins 8.9L ISL 350 / 1,000",
  },
  "cummins-l9|360": {
    torqueLbFt: 1150,
    source: "OEM MY22 Super Star: Cummins L 360 / 1,150 on M2-106",
  },
  "cummins-l9|380": {
    torqueLbFt: 1150,
    source: "MY17/MY18 LXE 40D + MY21 LXE: ISL9 / L9 380 / 1,150",
  },
  "cummins-l9|400": {
    torqueLbFt: 1250,
    source: "OEM MY11 Aspire / Ventana 40-ft class: ISL 8.9 / L9 400 / 1,250",
  },
  "cummins-l9|450": {
    torqueLbFt: 1250,
    source: "MY18 LXE 44H / 2024 American Coach Source 42Q: L9 / ISL9 450 / 1,250",
  },
  "cummins-x12|500": {
    torqueLbFt: 1695,
    source: "OEM MY19–20 Mountain Aire: X12 500 / 1,695",
  },
  "cummins-x12|525": {
    torqueLbFt: 1695,
    source: "OEM MY24–27 Mountain Aire: X12 525 / 1,695",
  },
  "cummins-x15|605": {
    torqueLbFt: 1950,
    source: "RVUSA 2019 Dream 45A + FCCC 2026 45A: X15 / ISX15 605 / 1,950",
  },
  "detroit-dd13|505": {
    torqueLbFt: 1850,
    source: "OEM MY20–23 Supreme Aire: DD13 505 / 1,850",
  },
  "detroit-dd13|525": {
    torqueLbFt: 1850,
    source: "Centurion 39N / MY24–25 Supreme Aire: DD13 525 / 1,850",
  },
  "detroit-dd16|600": {
    torqueLbFt: 1850,
    source: "Centurion 45D / Summit Aire: DD16 600 / 1,850",
  },
  "detroit-dd8|375": {
    torqueLbFt: 1050,
    source: "DX3 MY2021 brochure: Detroit DD8 375 / 1,050",
  },
  "ford-3.2|185": {
    torqueLbFt: 350,
    source: "OEM MY16 Gemini: Transit diesel 185 / 350",
  },
  "ford-3.5-eco|310": {
    torqueLbFt: 400,
    source: "OEM MY24–27 Granite Ridge 22T / MY25 Palladium: EcoBoost 310 / 400",
  },
  "ford-5.4|255": {
    torqueLbFt: 350,
    source: "2011_tim_f Tioga Montara: E-350 5.4 255 / 350",
  },
  "ford-6.8|305": {
    torqueLbFt: 420,
    source: "OEM 2014 Greyhawk 14-GREY-PL: 6.8 Triton V10 305 / 420",
  },
  "ford-6.8|320": {
    torqueLbFt: 460,
    source: "OEM 2016 Precept brochure: 6.8 Triton V10 320 / 460",
  },
  "ford-6.8|362": {
    torqueLbFt: 457,
    source: "OEM 2014 Precept 14-PRCT-PL: 6.8 Triton V10 362 / 457",
  },
  "ford-7.3|325": {
    torqueLbFt: 450,
    source: "OEM MY24–27 Greyhawk: E-450 7.3 325 / 450",
  },
  "ford-7.3|335": {
    torqueLbFt: 468,
    source: "OEM MY23–27 Precept Prestige: F53 7.3 335 / 468",
  },
  "ford-7.3|350": {
    torqueLbFt: 468,
    source: "OEM MY21–22 Greyhawk Prestige / Precept: 7.3 350 / 468",
  },
  "gm-6.0|342": {
    torqueLbFt: 373,
    source: "OEM MY21 Redhawk SE flyer: 6.0 Vortec 342 / 373",
  },
  "gm-6.6|401": {
    torqueLbFt: 464,
    source: "OEM MY22 Redhawk SE brochure: 6.6 Vortec 401 / 464",
  },
  "mb-2.0|208": {
    torqueLbFt: 332,
    source: "OEM 2026-freedom-aire: Sprinter 2.0 208 / 332",
  },
  "mb-2.0|211": {
    torqueLbFt: 332,
    source: "OEM MY24–25 Melbourne Prestige / MY27 Sanctuary: 2.0 211 / 332",
  },
  "navistar-maxxforce7|215": {
    torqueLbFt: 560,
    source: "OEM 2011_Allegro-Breeze: MaxxForce 7 215 / 560",
  },
  "navistar-maxxforce7|240": {
    torqueLbFt: 620,
    source: "OEM 2013_Allegro-Breeze: MaxxForce 7 240 / 620",
  },
  "ram-3.6|276": {
    torqueLbFt: 250,
    source: "OEM MY24–27 Comet / MY25 Twist: 3.6 276 / 250",
  },
  "ram-promaster|280": {
    torqueLbFt: 260,
    source: "OEM MY21–22 Sequence / Tellaro: ProMaster 280 / 260",
  },
};

function isFlaggedPowerStroke300(
  engine: string | null | undefined,
  horsepower: number,
): boolean {
  if (Math.round(horsepower) !== 300) return false;
  const e = (engine || "").toLowerCase();
  return /power\s*stroke/.test(e) && /6\.7/.test(e);
}

export function lookupPublishedEngineTorque(
  engine: string | null | undefined,
  horsepower: number,
): (PublishedEngineTorque & { key: string }) | null {
  // Boss discrete table FLAGS 300/750 (no clean OEM). 300/660 (2011–16
  // chassis cab) and 300/725 (F-650 99E) need year + application — this
  // lookup has neither, so Power Stroke 300 stays GAP.
  if (isFlaggedPowerStroke300(engine, horsepower)) return null;
  const key = engineVariantKey(engine, horsepower);
  if (!key) return null;
  const pin = ENGINE_TORQUE_BY_VARIANT[key];
  if (!pin) return null;
  return { key, ...pin };
}

export function applyPublishedEngineTorque<T extends TorquePin>(pin: T): T {
  if (pin.torqueLbFt != null && pin.torqueLbFt > 0) return pin;
  if (!(pin.horsepower > 0)) return pin;
  const found = lookupPublishedEngineTorque(pin.engine, pin.horsepower);
  if (!found) return pin;
  const stamp = `Torque ${found.torqueLbFt} lb-ft from published ${found.key} — ${found.source}`;
  return {
    ...pin,
    torqueLbFt: found.torqueLbFt,
    note: pin.note ? `${pin.note} · ${stamp}` : stamp,
  };
}
