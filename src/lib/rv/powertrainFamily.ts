/**
 * Engine-family vs chassis rules used by catalog bands AND Live merge.
 * Stops a Cummins pusher year-band (or Live guess) from painting on a
 * Sprinter / F53 / Transit coach — the Via 25T 2018 report failure mode.
 */

const CUMMINS_PUSHER =
  /\b(cummins|isl|l9|x15|x12|isx|powerglide)\b/i;
const CUMMINS_MID = /\b(isb|b6\.7)\b/i;
const MERCEDES_ENG =
  /\b(mercedes|om\d+|sprinter|3\.0l\s*v6|2\.0l\s*(i4|turbo)?)\b/i;
const F53_GAS = /\b(f-?53|godzilla|triton\s*v10|6\.8\s*l\s*v10)\b/i;
const PUSHER_CHASSIS =
  /\b(freightliner\s*xc|spartan|powerglide|tag\s*axle)\b/i;

export function chassisLooksSprinter(
  chassis?: string | null,
  engine?: string | null,
): boolean {
  const blob = `${chassis || ""} ${engine || ""}`;
  if (!/\b(sprinter|mercedes)\b/i.test(blob)) return false;
  if (PUSHER_CHASSIS.test(blob) || /\bf-?53\b/i.test(blob)) return false;
  return true;
}

export function engineLooksCumminsHeavy(engine?: string | null): boolean {
  const e = engine || "";
  if (MERCEDES_ENG.test(e) && !CUMMINS_PUSHER.test(e)) return false;
  if (CUMMINS_PUSHER.test(e)) return true;
  if (CUMMINS_MID.test(e) && !MERCEDES_ENG.test(e)) return true;
  return false;
}

/**
 * Returns a reason string if this engine cannot live on this chassis/coach.
 * Null means compatible (or not enough signal to reject).
 */
export function engineConflictsWithChassis(
  engine?: string | null,
  chassis?: string | null,
  extras?: { fuelType?: string | null; type?: string | null; modelEngine?: string | null },
): string | null {
  const e = engine || "";
  if (!e.trim()) return null;
  const chassisBlob = `${chassis || ""} ${extras?.modelEngine || ""}`;
  const fuel = extras?.fuelType || "";
  const type = extras?.type || "";

  const sprinter = chassisLooksSprinter(chassis, extras?.modelEngine);
  const heavyCummins = engineLooksCumminsHeavy(e);
  const mercedesEng = MERCEDES_ENG.test(e);
  const f53Chassis = /\bf-?53\b/i.test(chassisBlob);
  const gasCoach =
    /^gas/i.test(fuel) ||
    /class a gas/i.test(type) ||
    (F53_GAS.test(chassisBlob) && !/diesel/i.test(fuel));

  if (sprinter && heavyCummins && !mercedesEng) {
    return "Cummins/ISL/ISB pusher engine cannot sit on a Mercedes Sprinter chassis";
  }
  if (f53Chassis && heavyCummins) {
    return "Cummins diesel cannot sit on a Ford F53 chassis";
  }
  if (gasCoach && heavyCummins) {
    return "Cummins diesel cannot sit on a gas Class A";
  }
  if (
    PUSHER_CHASSIS.test(chassisBlob) &&
    F53_GAS.test(e) &&
    !/diesel/i.test(e)
  ) {
    return "Gas F53/Godzilla/V10 cannot sit on a diesel pusher chassis";
  }
  return null;
}

export function bandFitsCoach(
  spec: {
    chassis?: string;
    engine?: string;
    fuelType?: string;
    type?: string;
  },
  band: { engine?: string; chassis?: string },
): boolean {
  const reason = engineConflictsWithChassis(band.engine, spec.chassis, {
    fuelType: spec.fuelType,
    type: spec.type,
    modelEngine: spec.engine,
  });
  if (reason) return false;
  if (
    spec.engine &&
    engineConflictsWithChassis(band.engine, spec.engine, {
      fuelType: spec.fuelType,
      type: spec.type,
    })
  ) {
    return false;
  }
  return true;
}
