#!/usr/bin/env python3
"""
Ensure every motorized model active 2006–2015 has correct era powertrain
bands in rvData.ts, then regenerate exports/rvfax-catalog-models.json with
era-resolved engine/HP fields.
"""

from __future__ import annotations

import csv
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/workspace")
RVDATA = ROOT / "src/lib/rv/rvData.ts"
EXPORTS = ROOT / "exports"

MAKE_RE = re.compile(r'^  (?:"([^"]+)"|([A-Za-z][A-Za-z0-9 ]+)): \{', re.M)
MODEL_RE = re.compile(
    r'^    (?:"([^"]+)"|([A-Za-z0-9][A-Za-z0-9 /+\-]*)): \{', re.M
)

# Known model-specific 2006–2015 powertrains (overrides heuristics)
MODEL_ERA: dict[tuple[str, str], dict] = {
    ("Newmar", "Kountry Star"): {
        "from": 2006,
        "to": 2011,
        "engine": "Cummins ISB / Cat turbodiesel (by build)",
        "horsepower": 300,
        "chassis": "Freightliner / Spartan (by option)",
        "notes": "2006–2011 KS diesel pusher — not Ford 7.3 gas",
    },
    # 2012–2015 covered by existing 2012–2019 band; ensure script doesn't regress
}


def is_towable(typ: str, fuel: str) -> bool:
    t = f"{typ} {fuel}".lower()
    return any(
        x in t
        for x in [
            "travel trailer",
            "fifth wheel",
            "toy hauler",
            "truck camper",
            "towable",
        ]
    )


def era_powertrain(make: str, model: str, typ: str, fuel: str, top_engine: str | None) -> dict:
    """Return a 2006–2015 brochure-typical powertrain for this model family."""
    key = (make, model)
    if key in MODEL_ERA:
        return dict(MODEL_ERA[key])

    blob = f"{make} {model} {typ} {fuel} {top_engine or ''}".lower()
    typ_l = typ.lower()
    fuel_l = fuel.lower()

    # Dual chassis — describe both
    if "gas" in fuel_l and "diesel" in fuel_l:
        if "class c" in typ_l:
            return {
                "from": 2006,
                "to": 2015,
                "engine": "Ford Triton V10 6.8L / Mercedes Sprinter diesel (by plan)",
                "horsepower": 320,
                "chassis": "Ford E-450 / Mercedes Sprinter (by plan)",
                "notes": "2006–2015 dual-chassis Class C — no 7.3 Godzilla yet",
            }
        return {
            "from": 2006,
            "to": 2015,
            "engine": "Gas or diesel chassis by build (era)",
            "horsepower": 300,
            "notes": "Verify door sticker — dual fuel families in this era",
        }

    # Super C
    if "super c" in typ_l:
        return {
            "from": 2006,
            "to": 2015,
            "engine": "Cummins / Ford Super C diesel (era)",
            "horsepower": 300,
            "chassis": "Freightliner / Ford Super Duty (by build)",
            "notes": "Pre-modern Power Stroke 330 packaging on many Super Cs",
        }

    # Class B / B+
    if "class b" in typ_l:
        if "gas" in fuel_l and "diesel" not in fuel_l:
            if "ram" in blob or "promaster" in blob:
                return {
                    "from": 2006,
                    "to": 2015,
                    "engine": "Ram / Dodge 3.6L V6 gas (or earlier 3.6/3.0 by year)",
                    "horsepower": 280,
                    "chassis": "Ram ProMaster / earlier van chassis",
                }
            return {
                "from": 2006,
                "to": 2015,
                "engine": "Ford / Chevy / Dodge gas van chassis (era)",
                "horsepower": 275,
            }
        # diesel Class B — Sprinter dominates 2006–2015
        return {
            "from": 2006,
            "to": 2015,
            "engine": "Mercedes-Benz turbodiesel (Sprinter)",
            "horsepower": 188,
            "chassis": "Mercedes-Benz Sprinter",
            "notes": "Sprinter OM642 / era diesel ~188 HP class",
        }

    # Class C gas
    if "class c" in typ_l and "diesel" not in typ_l and "diesel" not in fuel_l:
        return {
            "from": 2006,
            "to": 2015,
            "engine": "Ford Triton V10 6.8L (E-450 / F-53 cutaway era)",
            "horsepower": 305,
            "chassis": "Ford E-450",
            "notes": "Pre-Godzilla Class C — Triton V10 era (7.3 gas arrives ~2020)",
        }

    # Class C diesel (Sprinter-based Prism etc.)
    if "class c" in typ_l and ("diesel" in typ_l or "diesel" in fuel_l):
        return {
            "from": 2006,
            "to": 2015,
            "engine": "Mercedes-Benz 3.0L V6 turbodiesel (Sprinter)",
            "horsepower": 188,
            "chassis": "Mercedes-Benz Sprinter",
        }

    # Class A Gas
    if "class a" in typ_l and "gas" in typ_l or (
        "class a" in typ_l and fuel_l == "gas"
    ):
        return {
            "from": 2006,
            "to": 2015,
            "engine": "Ford Triton V10 6.8L",
            "horsepower": 320,
            "chassis": "Ford F53",
            "notes": "2006–2015 gas Class A — Triton V10 (not 7.3 Godzilla)",
        }

    # Class A Diesel — tier by name
    if "class a" in typ_l and "diesel" in (typ_l + " " + fuel_l):
        high = any(
            x in blob
            for x in [
                "king aire",
                "london aire",
                "essex",
                "anthem",
                "inspire",
                "intrigue",
                "signature",
                "providence",
                "isx",
                "x15",
            ]
        )
        upper_mid = any(
            x in blob
            for x in [
                "dutch star",
                "mountain aire",
                "phaeton",
                "allegro bus",
                "aspire",
                "allure",
                "marquis",
                "windsor",
                "isl 450",
                "l9",
            ]
        )
        if high:
            return {
                "from": 2006,
                "to": 2015,
                "engine": "Cummins ISX 600HP class",
                "horsepower": 600,
                "chassis": "Spartan / Freightliner (by model)",
                "notes": "Flagship diesel era — ISX 600 class (pre-X15 naming)",
            }
        if upper_mid:
            return {
                "from": 2006,
                "to": 2015,
                "engine": "Cummins ISL 400–450HP class",
                "horsepower": 400,
                "chassis": "Freightliner / Spartan (by option)",
                "notes": "High-line diesel 2006–2015 — ISL class (not Ford gas)",
            }
        # entry/mid diesel pusher
        return {
            "from": 2006,
            "to": 2015,
            "engine": "Cummins ISB / ISL mid-diesel (era)",
            "horsepower": 340,
            "chassis": "Freightliner XC",
            "notes": "Mid diesel pusher 2006–2015 — not F53 gas, not modern L9 default",
        }

    # Fallback from top engine string
    eng = top_engine or ""
    if re.search(r"cummins|isb|isl|isx|diesel", eng, re.I):
        m = re.search(r"(\d{2,4})\s*HP", eng, re.I)
        hp = int(m.group(1)) if m else 340
        return {
            "from": 2006,
            "to": 2015,
            "engine": re.sub(r"godzilla|7\.3L V8 Godzilla", "Cummins diesel (era)", eng, flags=re.I),
            "horsepower": min(hp, 450) if "isx" not in eng.lower() else hp,
            "notes": "Derived from catalog diesel family for 2006–2015",
        }
    if re.search(r"godzilla|7\.3", eng, re.I):
        return {
            "from": 2006,
            "to": 2015,
            "engine": "Ford Triton V10 6.8L",
            "horsepower": 320,
            "chassis": "Ford F53 / E-450 (by class)",
            "notes": "Replaced modern Godzilla label for 2006–2015 era",
        }
    if re.search(r"v10|triton|6\.8", eng, re.I):
        return {
            "from": 2006,
            "to": 2015,
            "engine": "Ford Triton V10 6.8L",
            "horsepower": 320,
        }
    if re.search(r"mercedes|sprinter", eng, re.I):
        return {
            "from": 2006,
            "to": 2015,
            "engine": "Mercedes-Benz turbodiesel (Sprinter)",
            "horsepower": 188,
        }
    if re.search(r"ram|3\.6", eng, re.I):
        return {
            "from": 2006,
            "to": 2015,
            "engine": eng,
            "horsepower": 280,
        }

    return {
        "from": 2006,
        "to": 2015,
        "engine": eng or "See chassis / build sheet",
        "horsepower": 300,
        "notes": "Generic 2006–2015 estimate — verify OEM brochure",
    }


def make_name(m: re.Match) -> str:
    return m.group(1) or m.group(2)


def model_name(m: re.Match) -> str:
    return m.group(1) or m.group(2)


def iter_models(src: str):
    makes = list(MAKE_RE.finditer(src))
    for i, mk in enumerate(makes):
        m_start = mk.start()
        m_end = makes[i + 1].start() if i + 1 < len(makes) else src.rfind("};") + 1
        make_src = src[m_start:m_end]
        make = make_name(mk)
        models = list(MODEL_RE.finditer(make_src))
        for j, md in enumerate(models):
            rel = md.start()
            rel_end = models[j + 1].start() if j + 1 < len(models) else len(make_src)
            yield {
                "make": make,
                "model": model_name(md),
                "abs": m_start + rel,
                "abs_end": m_start + rel_end,
                "block": src[m_start + rel : m_start + rel_end],
            }


def get_str(block: str, field: str) -> str | None:
    m = re.search(rf'{field}:\s*"([^"]*)"', block)
    return m.group(1) if m else None


def get_num(block: str, field: str) -> int | None:
    m = re.search(rf"{field}:\s*(\d+)", block)
    return int(m.group(1)) if m else None


def era_years_for_block(block: str) -> list[int]:
    years = sorted(
        {
            int(y)
            for y in re.findall(r'\n\s+"(\d{4})":\s*\[', block)
            if 1990 <= int(y) <= 2030
        }
    )
    era = [y for y in years if 2006 <= y <= 2015]
    if era:
        return era
    ys = get_num(block, "yearStart")
    ye = get_num(block, "yearEnd")
    if ys is None and years:
        ys = min(years)
    if ye is None and years:
        ye = max(years)
    if ys is None:
        ys = 2000
    if ye is None:
        ye = 2026
    if ye >= 2006 and ys <= 2015:
        return list(range(max(ys, 2006), min(ye, 2015) + 1))
    return []


def parse_bands(block: str) -> list[dict]:
    out = []
    for m in re.finditer(
        r"\{\s*from:\s*(\d+),\s*to:\s*(\d+),((?:[^{}]|\n)*)\}", block
    ):
        body = m.group(3)
        eng = re.search(r'engine:\s*"([^"]+)"', body)
        hp = re.search(r"horsepower:\s*(\d+)", body)
        ch = re.search(r'chassis:\s*"([^"]+)"', body)
        notes = re.search(r'notes:\s*"([^"]+)"', body)
        out.append(
            {
                "from": int(m.group(1)),
                "to": int(m.group(2)),
                "engine": eng.group(1) if eng else None,
                "horsepower": int(hp.group(1)) if hp else None,
                "chassis": ch.group(1) if ch else None,
                "notes": notes.group(1) if notes else None,
                "raw": m.group(0),
                "span": (m.start(), m.end()),
            }
        )
    return out


def band_covers_era(bands: list[dict]) -> bool:
    # every year 2006-2015 that model needs... we only require some overlap with full cover of min-max era years present
    covered = set()
    for b in bands:
        for y in range(b["from"], b["to"] + 1):
            if 2006 <= y <= 2015:
                covered.add(y)
    return len(covered) >= 1  # at least one year; we'll ensure continuous cover below


def years_covered(bands: list[dict]) -> set[int]:
    c = set()
    for b in bands:
        for y in range(b["from"], b["to"] + 1):
            if 2006 <= y <= 2015:
                c.add(y)
    return c


def format_band(b: dict) -> str:
    lines = [
        "        {",
        f"          from: {b['from']},",
        f"          to: {b['to']},",
        f'          engine: "{b["engine"]}",',
    ]
    if b.get("horsepower") is not None:
        lines.append(f"          horsepower: {b['horsepower']},")
    if b.get("chassis"):
        lines.append(f'          chassis: "{b["chassis"]}",')
    if b.get("notes"):
        # escape quotes in notes
        notes = b["notes"].replace('"', '\\"')
        lines.append(f'          notes: "{notes}"')
    else:
        # remove trailing comma from last field if notes absent - keep trailing comma ok in TS? 
        # existing file uses trailing commas
        pass
    # ensure last property has no issue - use trailing commas throughout
    lines.append("        }")
    # fix missing commas between properties - rebuild carefully
    props = [f"          from: {b['from']},", f"          to: {b['to']},", f'          engine: "{b["engine"]}",']
    if b.get("horsepower") is not None:
        props.append(f"          horsepower: {b['horsepower']},")
    if b.get("chassis"):
        props.append(f'          chassis: "{b["chassis"]}",')
    if b.get("notes"):
        notes = b["notes"].replace('"', '\\"')
        props.append(f'          notes: "{notes}"')
    else:
        # strip trailing comma from last prop
        props[-1] = props[-1].rstrip(",")
    return "        {\n" + "\n".join(props) + "\n        }"


def band_is_bad_for_era(b: dict, typ: str, fuel: str) -> bool:
    eng = b.get("engine") or ""
    # Godzilla / 7.3 on bands ending 2015 or earlier is wrong
    if b["to"] <= 2015 and re.search(r"godzilla|7\.3L V8 Godzilla", eng, re.I):
        return True
    diesel = "diesel" in typ.lower() or fuel.lower() == "diesel"
    if diesel and re.search(r"godzilla|triton|v10|f-?53", eng, re.I) and not re.search(
        r"cummins|isb|isl|isx|power stroke|diesel", eng, re.I
    ):
        return True
    if b.get("horsepower") is None and eng:
        return True
    return False


def ensure_era_bands(block: str, make: str, model: str) -> tuple[str, list[str]]:
    notes: list[str] = []
    typ = get_str(block, "type") or ""
    fuel = get_str(block, "fuelType") or ""
    if is_towable(typ, fuel):
        return block, notes

    era = era_years_for_block(block)
    if not era:
        return block, notes

    top_engine = get_str(block, "engine")
    bands = parse_bands(block)
    need_years = set(era)
    covered = years_covered(bands)
    missing = sorted(need_years - covered)

    # Fix bad existing bands that overlap 2006-2015
    new_block = block
    for b in bands:
        if b["to"] < 2006 or b["from"] > 2015:
            continue
        if band_is_bad_for_era(b, typ, fuel):
            fix = era_powertrain(make, model, typ, fuel, top_engine)
            # keep original from/to if partially in era
            fixed = {
                "from": b["from"],
                "to": b["to"],
                "engine": fix["engine"],
                "horsepower": fix.get("horsepower"),
                "chassis": fix.get("chassis") or b.get("chassis"),
                "notes": fix.get("notes") or "Corrected 2006–2015 era powertrain",
            }
            new_block = new_block.replace(b["raw"], format_band(fixed), 1)
            notes.append(f"fixed band {b['from']}-{b['to']} → {fixed['engine']}")

    # re-parse after fixes
    bands = parse_bands(new_block)
    covered = years_covered(bands)
    missing = sorted(need_years - covered)

    # Special case Kountry: ensure 2006-2011 and 2012-2015 covered (existing should)
    if make == "Newmar" and model == "Kountry Star":
        # force correct engines on any band overlapping era
        for b in parse_bands(new_block):
            if b["to"] < 2006 or b["from"] > 2015:
                continue
            eng = b.get("engine") or ""
            if re.search(r"godzilla|7\.3|triton|f-?53|v10", eng, re.I) and not re.search(
                r"cummins", eng, re.I
            ):
                if b["to"] <= 2011:
                    fixed = {
                        "from": b["from"],
                        "to": min(b["to"], 2011),
                        "engine": "Cummins ISB / Cat turbodiesel (by build)",
                        "horsepower": 300,
                        "chassis": "Freightliner / Spartan (by option)",
                        "notes": "Kountry Star diesel 2006–2011",
                    }
                else:
                    fixed = {
                        "from": max(b["from"], 2012),
                        "to": b["to"],
                        "engine": "Cummins ISB / B6.7 diesel ~300–360HP",
                        "horsepower": 340,
                        "chassis": "Freightliner XC / XCR",
                        "notes": "Kountry Star diesel 2012–2015",
                    }
                new_block = new_block.replace(b["raw"], format_band(fixed), 1)
                notes.append("Kountry era diesel lock")

        bands = parse_bands(new_block)
        covered = years_covered(bands)
        missing = sorted(need_years - covered)

    if not missing:
        # Still fill null HP on era bands
        for b in parse_bands(new_block):
            if b["to"] < 2006 or b["from"] > 2015:
                continue
            if b.get("horsepower") is None and b.get("engine"):
                hp = era_powertrain(make, model, typ, fuel, b["engine"]).get(
                    "horsepower", 300
                )
                fixed = dict(b)
                fixed["horsepower"] = hp
                # drop raw
                fixed.pop("raw", None)
                fixed.pop("span", None)
                new_block = new_block.replace(b["raw"], format_band(fixed), 1)
                notes.append(f"filled band HP {hp} for {b['from']}-{b['to']}")
        return new_block, notes

    # Insert a band covering missing years (contiguous ranges)
    def ranges(ys: list[int]) -> list[tuple[int, int]]:
        if not ys:
            return []
        out = []
        a = b = ys[0]
        for y in ys[1:]:
            if y == b + 1:
                b = y
            else:
                out.append((a, b))
                a = b = y
        out.append((a, b))
        return out

    pt = era_powertrain(make, model, typ, fuel, top_engine)
    new_bands_txt = []
    for a, b in ranges(missing):
        nb = {
            "from": a,
            "to": b,
            "engine": pt["engine"],
            "horsepower": pt.get("horsepower"),
            "chassis": pt.get("chassis"),
            "notes": pt.get("notes")
            or f"2006–2015 era powertrain for {make} {model}",
        }
        new_bands_txt.append(format_band(nb))
        notes.append(f"added band {a}-{b}: {nb['engine']} / {nb['horsepower']}HP")

    insert = ",\n".join(new_bands_txt)

    if "powertrainByYear:" in new_block:
        # insert before closing of powertrainByYear array
        m = re.search(r"powertrainByYear:\s*\[", new_block)
        if not m:
            return new_block, notes
        # find matching close bracket at band array level — simple: before first `]\n    }` after powertrain
        start = m.end()
        # if array empty
        rest = new_block[start:]
        # find the end of array by bracket count
        depth = 1
        idx = 0
        while idx < len(rest) and depth:
            if rest[idx] == "[":
                depth += 1
            elif rest[idx] == "]":
                depth -= 1
            idx += 1
        arr_body = rest[: idx - 1]
        arr_end_abs = start + idx - 1
        if arr_body.strip():
            # prepend comma after existing last band
            new_arr = arr_body.rstrip() + ",\n" + insert + "\n      "
        else:
            new_arr = "\n" + insert + "\n      "
        new_block = new_block[:start] + new_arr + new_block[arr_end_abs:]
    else:
        # insert powertrainByYear before description or before closing of model
        pt_block = f"      powertrainByYear: [\n{insert}\n      ],\n"
        if re.search(r"\n      description:", new_block):
            new_block = re.sub(
                r"\n      description:",
                "\n" + pt_block + "      description:",
                new_block,
                count=1,
            )
        else:
            # before final `    },` of model - last occurrence of image/description fields
            # append before the trailing whitespace ending the model block
            new_block = new_block.rstrip() + "\n" + pt_block

    return new_block, notes


def resolve_era_snapshot(bands: list[dict], top_engine, top_hp, typ, fuel, make, model) -> dict:
    """Pick band covering 2010 (mid) or latest era band."""
    era_bands = [b for b in bands if b["to"] >= 2006 and b["from"] <= 2015]
    if not era_bands:
        pt = era_powertrain(make, model, typ, fuel, top_engine)
        return {
            "engine": pt["engine"],
            "horsepower": pt.get("horsepower"),
            "chassis": pt.get("chassis"),
            "source": "inferred",
        }
    # prefer band covering 2010, else latest end year
    cover = [b for b in era_bands if b["from"] <= 2010 <= b["to"]]
    b = cover[0] if cover else sorted(era_bands, key=lambda x: x["to"])[-1]
    return {
        "engine": b.get("engine"),
        "horsepower": b.get("horsepower"),
        "chassis": b.get("chassis"),
        "from": b["from"],
        "to": b["to"],
        "source": "powertrainByYear",
    }


def regenerate_export(src: str) -> dict:
    models = []
    for sp in iter_models(src):
        block = sp["block"]
        typ = get_str(block, "type") or ""
        fuel = get_str(block, "fuelType") or ""
        engine = get_str(block, "engine")
        hp = get_num(block, "horsepower")
        chassis = get_str(block, "chassis")
        ys = get_num(block, "yearStart")
        ye = get_num(block, "yearEnd")
        fps_m = re.search(r"floorplans:\s*\[([^\]]*)\]", block)
        floorplans = re.findall(r'"([^"]+)"', fps_m.group(1)) if fps_m else []
        years = sorted(
            {
                int(y)
                for y in re.findall(r'\n\s+"(\d{4})":\s*\[', block)
                if 1990 <= int(y) <= 2030
            }
        )
        lr = re.search(r"lengthRange:\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]", block)
        wr = re.search(r"weightRange:\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]", block)
        sleeps = get_num(block, "sleeps")
        slides = get_num(block, "slideouts")
        rating_m = re.search(r"rating:\s*([0-9.]+)", block)
        bands = parse_bands(block)
        band_export = [
            {
                "from": b["from"],
                "to": b["to"],
                "engine": b.get("engine"),
                "horsepower": b.get("horsepower"),
                "chassis": b.get("chassis"),
                "notes": b.get("notes"),
            }
            for b in bands
        ]
        era_active = any(2006 <= y <= 2015 for y in years) or (
            (ys or 2000) <= 2015 and (ye or 2026) >= 2006
        )
        era_snap = None
        if era_active and not is_towable(typ, fuel):
            era_snap = resolve_era_snapshot(
                bands, engine, hp, typ, fuel, sp["make"], sp["model"]
            )

        rec = {
            "make": sp["make"],
            "model": sp["model"],
            "type": typ,
            "fuelType": fuel,
            "engine": engine,
            "horsepower": hp,
            "chassis": chassis,
            "yearStart": ys if ys else (min(years) if years else None),
            "yearEnd": ye if ye else (max(years) if years else None),
            "floorplanCount": len(floorplans),
            "floorplans": floorplans,
            "yearsWithFloorplans": years,
            "lengthMinFt": int(lr.group(1)) if lr else None,
            "lengthMaxFt": int(lr.group(2)) if lr else None,
            "weightMinLbs": int(wr.group(1)) if wr else None,
            "weightMaxLbs": int(wr.group(2)) if wr else None,
            "sleeps": sleeps,
            "slideouts": slides,
            "rating": float(rating_m.group(1)) if rating_m else None,
            "powertrainByYear": band_export,
        }
        if era_snap:
            rec["era2006_2015"] = {
                "engine": era_snap.get("engine"),
                "horsepower": era_snap.get("horsepower"),
                "chassis": era_snap.get("chassis"),
                "bandFrom": era_snap.get("from"),
                "bandTo": era_snap.get("to"),
                "source": era_snap.get("source"),
            }
            # Also expose flat fields for consumers that only read engine/HP for that era
            rec["engine2006_2015"] = era_snap.get("engine")
            rec["horsepower2006_2015"] = era_snap.get("horsepower")
        models.append(rec)

    makes = sorted({m["make"] for m in models})
    return {
        "exportedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "src/lib/rv/rvData.ts",
        "eraFocus": "2006-2015 powertrain pass",
        "makeCount": len(makes),
        "modelCount": len(models),
        "models": sorted(models, key=lambda x: (x["make"].lower(), x["model"].lower())),
    }


def main() -> None:
    src = RVDATA.read_text()
    replacements = []
    notes_all = []
    for sp in iter_models(src):
        new_block, notes = ensure_era_bands(sp["block"], sp["make"], sp["model"])
        if new_block != sp["block"]:
            replacements.append((sp["abs"], sp["abs_end"], new_block))
            for n in notes:
                notes_all.append(f"{sp['make']}/{sp['model']}: {n}")

    replacements.sort(key=lambda x: x[0], reverse=True)
    out = src
    for a, b, nb in replacements:
        out = out[:a] + nb + out[b:]
    if out != src:
        RVDATA.write_text(out)
        print(f"Updated rvData.ts — {len(replacements)} models")
    else:
        print("No rvData text changes")
    print(f"Notes: {len(notes_all)}")
    for n in notes_all[:80]:
        print(" -", n)

    src2 = RVDATA.read_text()
    # sanity braces
    if src2.count("{") != src2.count("}"):
        raise SystemExit(
            f"Brace mismatch {{ {src2.count('{')} }} {src2.count('}')}"
        )

    payload = regenerate_export(src2)
    EXPORTS.mkdir(exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    for name in [
        "rvfax-catalog-models.json",
        f"rvfax-catalog-models-{stamp}.json",
    ]:
        (EXPORTS / name).write_text(json.dumps(payload, indent=2) + "\n")

    # CSV with era columns
    fields = [
        "make",
        "model",
        "type",
        "fuelType",
        "engine",
        "horsepower",
        "engine2006_2015",
        "horsepower2006_2015",
        "chassis",
        "yearStart",
        "yearEnd",
        "floorplanCount",
        "lengthMinFt",
        "lengthMaxFt",
        "weightMinLbs",
        "weightMaxLbs",
        "sleeps",
        "slideouts",
        "rating",
    ]
    for name in [
        "rvfax-catalog-models.csv",
        f"rvfax-catalog-models-{stamp}.csv",
    ]:
        with (EXPORTS / name).open("w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
            w.writeheader()
            for m in payload["models"]:
                w.writerow(m)

    # TXT focus 2006-2015 motorized
    lines = [
        f"RvFACTS 2006–2015 powertrain pass — {payload['exportedAt']}",
        f"Makes {payload['makeCount']} · Models {payload['modelCount']}",
        "",
        "Motorized models with 2006–2015 engine/HP:",
    ]
    for m in payload["models"]:
        if "engine2006_2015" not in m:
            continue
        lines.append(
            f"- {m['make']} {m['model']}: {m['engine2006_2015']} | HP={m['horsepower2006_2015']} | modern={m.get('engine')} / {m.get('horsepower')} | {m.get('type')}"
        )
    for name in [
        "rvfax-catalog-models.txt",
        f"rvfax-catalog-models-{stamp}.txt",
    ]:
        (EXPORTS / name).write_text("\n".join(lines) + "\n")

    # Validations
    ks = next(
        m
        for m in payload["models"]
        if m["make"] == "Newmar" and m["model"] == "Kountry Star"
    )
    print(
        "Kountry Star era:",
        ks.get("engine2006_2015"),
        ks.get("horsepower2006_2015"),
        "modern:",
        ks.get("engine"),
        ks.get("horsepower"),
    )
    assert "Cummins" in (ks.get("engine2006_2015") or "")
    assert "Godzilla" not in (ks.get("engine2006_2015") or "")
    assert "Cummins" in (ks.get("engine") or "")

    # No diesel era field with pure gas Godzilla
    bad = [
        m
        for m in payload["models"]
        if m.get("engine2006_2015")
        and (
            "diesel" in (m.get("type") or "").lower()
            or (m.get("fuelType") or "").lower() == "diesel"
        )
        and re.search(r"godzilla|7\.3", m["engine2006_2015"] or "", re.I)
        and not re.search(r"cummins|diesel|sprinter", m["engine2006_2015"] or "", re.I)
    ]
    print("diesel era still gas-only:", len(bad))
    for m in bad[:10]:
        print(" ", m["make"], m["model"], m["engine2006_2015"])

    # motorized era null hp
    null_hp = [
        m
        for m in payload["models"]
        if m.get("engine2006_2015") and m.get("horsepower2006_2015") is None
    ]
    print("era null HP:", len(null_hp))
    for m in null_hp[:15]:
        print(" ", m["make"], m["model"], m["engine2006_2015"])

    print(
        "Export OK",
        payload["modelCount"],
        "models;",
        sum(1 for m in payload["models"] if "engine2006_2015" in m),
        "with 2006-2015 fields",
    )


if __name__ == "__main__":
    main()
