#!/usr/bin/env python3
"""
2000–2005 powertrain pass for rvData.ts + regenerate catalog export
with engine2000_2005 / horsepower2000_2005 fields.
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

ERA_LO, ERA_HI = 2000, 2005

MAKE_RE = re.compile(r'^  (?:"([^"]+)"|([A-Za-z][A-Za-z0-9 ]+)): \{', re.M)
MODEL_RE = re.compile(
    r'^    (?:"([^"]+)"|([A-Za-z0-9][A-Za-z0-9 /+\-]*)): \{', re.M
)


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
    """Brochure-typical powertrain for 2000–2005."""
    blob = f"{make} {model} {typ} {fuel}".lower()  # do NOT include top_engine (avoids X15/Godzilla contamination)
    typ_l = typ.lower()
    fuel_l = fuel.lower()

    # Kountry Star — diesel pusher (some early gas F53 builds exist; catalog treats as diesel line)
    if make == "Newmar" and model == "Kountry Star":
        return {
            "from": ERA_LO,
            "to": ERA_HI,
            "engine": "Cummins ISB / Cat turbodiesel (by build)",
            "horsepower": 300,
            "chassis": "Freightliner / Spartan (by option)",
            "notes": "2000–2005 Kountry Star diesel pusher — not Ford 7.3 gas",
        }

    if "gas" in fuel_l and "diesel" in fuel_l:
        if "class c" in typ_l:
            return {
                "from": ERA_LO,
                "to": ERA_HI,
                "engine": "Ford Triton V10 6.8L / Mercedes Sprinter diesel (by plan)",
                "horsepower": 305,
                "chassis": "Ford E-450 / Mercedes Sprinter (by plan)",
                "notes": "2000–2005 dual-chassis Class C",
            }
        return {
            "from": ERA_LO,
            "to": ERA_HI,
            "engine": "Gas or diesel chassis by build (2000–2005)",
            "horsepower": 300,
        }

    if "super c" in typ_l:
        return {
            "from": ERA_LO,
            "to": ERA_HI,
            "engine": "Cummins / Caterpillar Super C diesel (era)",
            "horsepower": 300,
            "chassis": "Freightliner / Ford Super Duty (by build)",
        }

    if "class b" in typ_l:
        if "gas" in fuel_l and "diesel" not in fuel_l:
            return {
                "from": ERA_LO,
                "to": ERA_HI,
                "engine": "Dodge / Chevy / Ford gas van chassis (era)",
                "horsepower": 250,
            }
        return {
            "from": ERA_LO,
            "to": ERA_HI,
            "engine": "Mercedes-Benz turbodiesel (Sprinter / early T1N–NCV3)",
            "horsepower": 154,
            "chassis": "Mercedes-Benz Sprinter",
            "notes": "Early Sprinter era — ~154–188 HP by year",
        }

    if "class c" in typ_l and "diesel" not in typ_l and "diesel" not in fuel_l:
        return {
            "from": ERA_LO,
            "to": ERA_HI,
            "engine": "Ford Triton V10 6.8L",
            "horsepower": 305,
            "chassis": "Ford E-450",
            "notes": "2000–2005 Class C gas — Triton V10 (not 7.3 Godzilla)",
        }

    if "class c" in typ_l and ("diesel" in typ_l or "diesel" in fuel_l):
        return {
            "from": ERA_LO,
            "to": ERA_HI,
            "engine": "Mercedes-Benz turbodiesel (Sprinter)",
            "horsepower": 154,
            "chassis": "Mercedes-Benz Sprinter",
        }

    if ("class a" in typ_l and "gas" in typ_l) or (
        "class a" in typ_l and fuel_l == "gas"
    ):
        return {
            "from": ERA_LO,
            "to": ERA_HI,
            "engine": "Ford Triton V10 6.8L",
            "horsepower": 310,
            "chassis": "Ford F53",
            "notes": "2000–2005 gas Class A — Triton V10 era",
        }

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
                "american dream",
                "american eagle",
                "cornerstone",
                "dynasty",
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
                "navigator",
            ]
        )
        if high:
            return {
                "from": ERA_LO,
                "to": ERA_HI,
                "engine": "Cummins ISX / ISM 500–600HP class",
                "horsepower": 500,
                "chassis": "Spartan / Freightliner (by model)",
                "notes": "Flagship diesel 2000–2005 — ISX/ISM class (not X15, not gas F53)",
            }
        if upper_mid:
            return {
                "from": ERA_LO,
                "to": ERA_HI,
                "engine": "Cummins ISL / ISC 330–400HP class",
                "horsepower": 350,
                "chassis": "Freightliner / Spartan (by option)",
                "notes": "High-line diesel 2000–2005 — ISL/ISC class",
            }
        return {
            "from": ERA_LO,
            "to": ERA_HI,
            "engine": "Cummins ISB / ISC mid-diesel (era)",
            "horsepower": 300,
            "chassis": "Freightliner XC",
            "notes": "Mid diesel pusher 2000–2005 — Cummins diesel, not Ford 7.3 gas",
        }

    eng = top_engine or "See chassis / build sheet"
    if re.search(r"godzilla|7\.3", eng, re.I):
        return {
            "from": ERA_LO,
            "to": ERA_HI,
            "engine": "Ford Triton V10 6.8L",
            "horsepower": 310,
            "notes": "Replaced modern Godzilla label for 2000–2005",
        }
    if re.search(r"x15|605", eng, re.I):
        return {
            "from": ERA_LO,
            "to": ERA_HI,
            "engine": "Cummins ISX 600HP class",
            "horsepower": 600,
            "notes": "Pre-X15 naming — ISX era",
        }
    if re.search(r"cummins|isb|isl|isx|diesel", eng, re.I):
        m = re.search(r"(\d{2,4})\s*HP", eng, re.I)
        hp = int(m.group(1)) if m else 330
        return {
            "from": ERA_LO,
            "to": ERA_HI,
            "engine": eng,
            "horsepower": hp,
        }
    if re.search(r"v10|triton|6\.8", eng, re.I):
        return {
            "from": ERA_LO,
            "to": ERA_HI,
            "engine": "Ford Triton V10 6.8L",
            "horsepower": 310,
        }
    if re.search(r"mercedes|sprinter", eng, re.I):
        return {
            "from": ERA_LO,
            "to": ERA_HI,
            "engine": "Mercedes-Benz turbodiesel (Sprinter)",
            "horsepower": 154,
        }
    return {
        "from": ERA_LO,
        "to": ERA_HI,
        "engine": eng,
        "horsepower": 300,
        "notes": "Generic 2000–2005 estimate — verify OEM brochure",
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
    era = [y for y in years if ERA_LO <= y <= ERA_HI]
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
    if ye >= ERA_LO and ys <= ERA_HI:
        return list(range(max(ys, ERA_LO), min(ye, ERA_HI) + 1))
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
            }
        )
    return out


def years_covered(bands: list[dict]) -> set[int]:
    c = set()
    for b in bands:
        for y in range(b["from"], b["to"] + 1):
            if ERA_LO <= y <= ERA_HI:
                c.add(y)
    return c


def format_band(b: dict) -> str:
    props = [
        f"          from: {b['from']},",
        f"          to: {b['to']},",
        f'          engine: "{b["engine"]}",',
    ]
    if b.get("horsepower") is not None:
        props.append(f"          horsepower: {b['horsepower']},")
    if b.get("chassis"):
        props.append(f'          chassis: "{b["chassis"]}",')
    if b.get("notes"):
        notes = b["notes"].replace('"', '\\"')
        props.append(f'          notes: "{notes}"')
    else:
        props[-1] = props[-1].rstrip(",")
    return "        {\n" + "\n".join(props) + "\n        }"


def band_is_bad_for_era(b: dict, typ: str, fuel: str) -> bool:
    eng = b.get("engine") or ""
    if b["to"] <= ERA_HI and re.search(r"godzilla|7\.3L V8 Godzilla|X15", eng, re.I):
        return True
    diesel = "diesel" in typ.lower() or fuel.lower() == "diesel"
    if diesel and re.search(r"godzilla|triton|v10|f-?53", eng, re.I) and not re.search(
        r"cummins|isb|isl|isx|isc|cat|power stroke|diesel", eng, re.I
    ):
        return True
    if b.get("horsepower") is None and eng:
        return True
    return False


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
    new_block = block
    bands = parse_bands(new_block)

    # Fix bad overlapping bands
    for b in bands:
        if b["to"] < ERA_LO or b["from"] > ERA_HI:
            continue
        if band_is_bad_for_era(b, typ, fuel):
            fix = era_powertrain(make, model, typ, fuel, top_engine)
            fixed = {
                "from": b["from"],
                "to": b["to"],
                "engine": fix["engine"],
                "horsepower": fix.get("horsepower"),
                "chassis": fix.get("chassis") or b.get("chassis"),
                "notes": fix.get("notes") or "Corrected 2000–2005 era powertrain",
            }
            new_block = new_block.replace(b["raw"], format_band(fixed), 1)
            notes.append(f"fixed band {b['from']}-{b['to']} → {fixed['engine']}")

    bands = parse_bands(new_block)
    need = set(era)
    missing = sorted(need - years_covered(bands))

    # Fill null HP on existing era bands
    for b in parse_bands(new_block):
        if b["to"] < ERA_LO or b["from"] > ERA_HI:
            continue
        if b.get("horsepower") is None and b.get("engine"):
            hp = era_powertrain(make, model, typ, fuel, b["engine"]).get(
                "horsepower", 300
            )
            fixed = {
                "from": b["from"],
                "to": b["to"],
                "engine": b["engine"],
                "horsepower": hp,
                "chassis": b.get("chassis"),
                "notes": b.get("notes"),
            }
            new_block = new_block.replace(b["raw"], format_band(fixed), 1)
            notes.append(f"filled band HP {hp} for {b['from']}-{b['to']}")

    bands = parse_bands(new_block)
    missing = sorted(need - years_covered(bands))
    if not missing:
        return new_block, notes

    # Prefer extending an adjacent band that ends at missing-1 or starts at missing+1
    # with same family — otherwise insert new band
    pt = era_powertrain(make, model, typ, fuel, top_engine)
    # Try extend existing band that borders missing years
    bands = parse_bands(new_block)
    still_missing = set(missing)
    for a, b in ranges(sorted(still_missing)):
        prev = next((x for x in bands if x["to"] == a - 1), None)
        nxt = next((x for x in bands if x["from"] == b + 1), None)
        # Only extend if neighbor is also in/near early era and not modern gas Godzilla
        if prev and prev["from"] <= ERA_HI and not re.search(
            r"godzilla|7\.3|X15", prev.get("engine") or "", re.I
        ):
            fixed = {
                "from": prev["from"],
                "to": b,
                "engine": prev["engine"],
                "horsepower": prev.get("horsepower"),
                "chassis": prev.get("chassis"),
                "notes": prev.get("notes"),
            }
            new_block = new_block.replace(prev["raw"], format_band(fixed), 1)
            notes.append(f"extend {prev['from']}-{prev['to']} → {prev['from']}-{b}")
            still_missing -= set(range(a, b + 1))
            bands = parse_bands(new_block)
            continue
        if nxt and nxt["to"] >= ERA_LO and not re.search(
            r"godzilla|7\.3|X15", nxt.get("engine") or "", re.I
        ):
            # don't extend modern 2020+ bands backward into 2000s
            if nxt["to"] > 2012:
                pass
            else:
                fixed = {
                    "from": a,
                    "to": nxt["to"],
                    "engine": nxt["engine"],
                    "horsepower": nxt.get("horsepower"),
                    "chassis": nxt.get("chassis"),
                    "notes": nxt.get("notes"),
                }
                new_block = new_block.replace(nxt["raw"], format_band(fixed), 1)
                notes.append(f"extend next {nxt['from']}-{nxt['to']} → {a}-{nxt['to']}")
                still_missing -= set(range(a, b + 1))
                bands = parse_bands(new_block)
                continue

        # insert new band
        nb = {
            "from": a,
            "to": b,
            "engine": pt["engine"],
            "horsepower": pt.get("horsepower"),
            "chassis": pt.get("chassis"),
            "notes": pt.get("notes")
            or f"2000–2005 era powertrain for {make} {model}",
        }
        insert = format_band(nb)
        if "powertrainByYear:" in new_block:
            m = re.search(r"powertrainByYear:\s*\[", new_block)
            start = m.end()
            rest = new_block[start:]
            depth = 1
            idx = 0
            while idx < len(rest) and depth:
                if rest[idx] == "[":
                    depth += 1
                elif rest[idx] == "]":
                    depth -= 1
                idx += 1
            arr_body = rest[: idx - 1]
            arr_end = start + idx - 1
            if arr_body.strip():
                new_arr = arr_body.rstrip() + ",\n" + insert + "\n      "
            else:
                new_arr = "\n" + insert + "\n      "
            new_block = new_block[:start] + new_arr + new_block[arr_end:]
        else:
            pt_block = f"      powertrainByYear: [\n{insert}\n      ],\n"
            if re.search(r"\n      description:", new_block):
                new_block = re.sub(
                    r"\n      description:",
                    "\n" + pt_block + "      description:",
                    new_block,
                    count=1,
                )
            else:
                new_block = new_block.rstrip() + "\n" + pt_block
        notes.append(f"added band {a}-{b}: {nb['engine']} / {nb['horsepower']}HP")
        still_missing -= set(range(a, b + 1))
        bands = parse_bands(new_block)

    return new_block, notes


def resolve_era_snapshot(bands, top_engine, typ, fuel, make, model):
    era_bands = [b for b in bands if b["to"] >= ERA_LO and b["from"] <= ERA_HI]
    if not era_bands:
        pt = era_powertrain(make, model, typ, fuel, top_engine)
        return {
            "engine": pt["engine"],
            "horsepower": pt.get("horsepower"),
            "chassis": pt.get("chassis"),
            "source": "inferred",
        }
    cover = [b for b in era_bands if b["from"] <= 2003 <= b["to"]]
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

        # prior era fields if present in previous export logic — recompute both
        era_active_00 = any(ERA_LO <= y <= ERA_HI for y in years) or (
            (ys or 2000) <= ERA_HI and (ye or 2026) >= ERA_LO
        )
        era_active_06 = any(2006 <= y <= 2015 for y in years) or (
            (ys or 2000) <= 2015 and (ye or 2026) >= 2006
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

        if era_active_00 and not is_towable(typ, fuel):
            snap = resolve_era_snapshot(
                bands, engine, typ, fuel, sp["make"], sp["model"]
            )
            rec["era2000_2005"] = {
                "engine": snap.get("engine"),
                "horsepower": snap.get("horsepower"),
                "chassis": snap.get("chassis"),
                "bandFrom": snap.get("from"),
                "bandTo": snap.get("to"),
                "source": snap.get("source"),
            }
            rec["engine2000_2005"] = snap.get("engine")
            rec["horsepower2000_2005"] = snap.get("horsepower")

        if era_active_06 and not is_towable(typ, fuel):
            # mid-year 2010 snapshot from bands
            era_bands = [b for b in bands if b["to"] >= 2006 and b["from"] <= 2015]
            if era_bands:
                cover = [b for b in era_bands if b["from"] <= 2010 <= b["to"]]
                b = cover[0] if cover else sorted(era_bands, key=lambda x: x["to"])[-1]
                rec["era2006_2015"] = {
                    "engine": b.get("engine"),
                    "horsepower": b.get("horsepower"),
                    "chassis": b.get("chassis"),
                    "bandFrom": b["from"],
                    "bandTo": b["to"],
                    "source": "powertrainByYear",
                }
                rec["engine2006_2015"] = b.get("engine")
                rec["horsepower2006_2015"] = b.get("horsepower")

        models.append(rec)

    makes = sorted({m["make"] for m in models})
    return {
        "exportedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "src/lib/rv/rvData.ts",
        "eraFocus": "2000-2005 powertrain pass (also retains 2006-2015 fields)",
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
    if out.count("{") != out.count("}"):
        raise SystemExit(f"Brace mismatch {out.count('{')} vs {out.count('}')}")

    if out != src:
        RVDATA.write_text(out)
        print(f"Updated rvData.ts — {len(replacements)} models")
    else:
        print("No rvData text changes")
    print(f"Notes: {len(notes_all)}")
    for n in notes_all[:70]:
        print(" -", n)

    src2 = RVDATA.read_text()
    payload = regenerate_export(src2)
    EXPORTS.mkdir(exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    for name in [
        "rvfax-catalog-models.json",
        f"rvfax-catalog-models-{stamp}.json",
    ]:
        (EXPORTS / name).write_text(json.dumps(payload, indent=2) + "\n")

    fields = [
        "make",
        "model",
        "type",
        "fuelType",
        "engine",
        "horsepower",
        "engine2000_2005",
        "horsepower2000_2005",
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

    lines = [
        f"RvFACTS 2000–2005 powertrain pass — {payload['exportedAt']}",
        f"Makes {payload['makeCount']} · Models {payload['modelCount']}",
        "",
        "Motorized 2000–2005 engine/HP:",
    ]
    for m in payload["models"]:
        if "engine2000_2005" not in m:
            continue
        lines.append(
            f"- {m['make']} {m['model']}: {m['engine2000_2005']} | HP={m['horsepower2000_2005']} | modern={m.get('engine')} / {m.get('horsepower')}"
        )
    for name in [
        "rvfax-catalog-models.txt",
        f"rvfax-catalog-models-{stamp}.txt",
    ]:
        (EXPORTS / name).write_text("\n".join(lines) + "\n")

    ks = next(
        m
        for m in payload["models"]
        if m["make"] == "Newmar" and m["model"] == "Kountry Star"
    )
    print(
        "Kountry Star 2000-05:",
        ks.get("engine2000_2005"),
        ks.get("horsepower2000_2005"),
        "| modern",
        ks.get("engine"),
        ks.get("horsepower"),
    )
    assert "Cummins" in (ks.get("engine2000_2005") or ks.get("engine") or "")
    assert not re.search(r"godzilla|7\.3", ks.get("engine2000_2005") or "", re.I)

    bad = [
        m
        for m in payload["models"]
        if m.get("engine2000_2005")
        and (
            "diesel" in (m.get("type") or "").lower()
            or (m.get("fuelType") or "").lower() == "diesel"
        )
        and re.search(r"godzilla|7\.3", m["engine2000_2005"] or "", re.I)
        and not re.search(
            r"cummins|diesel|sprinter|cat", m["engine2000_2005"] or "", re.I
        )
    ]
    print("diesel era still gas-only:", len(bad))
    null_hp = [
        m
        for m in payload["models"]
        if m.get("engine2000_2005") and m.get("horsepower2000_2005") is None
    ]
    print("era null HP:", len(null_hp))
    for m in null_hp[:10]:
        print(" ", m["make"], m["model"], m["engine2000_2005"])

    print(
        "Export OK",
        payload["modelCount"],
        "models;",
        sum(1 for m in payload["models"] if "engine2000_2005" in m),
        "with 2000-2005 fields",
    )


if __name__ == "__main__":
    main()
