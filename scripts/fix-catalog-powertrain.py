#!/usr/bin/env python3
"""
Correct engine/horsepower across src/lib/rv/rvData.ts (2016–present focus)
and regenerate exports/rvfax-catalog-models.{json,csv,txt}.

Handles both quoted and unquoted make/model keys in the TS object literal.
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

HP_FROM_ENGINE: list[tuple[re.Pattern[str], int]] = [
    (re.compile(r"x15|605\s*hp", re.I), 605),
    (re.compile(r"isx.*600|600\s*hp", re.I), 600),
    (re.compile(r"x12|500\s*hp", re.I), 500),
    (re.compile(r"l9|isl.*450|450\s*hp", re.I), 450),
    (re.compile(r"isl\s*400|400\s*hp", re.I), 400),
    (re.compile(r"isl\s*380|380\s*hp", re.I), 380),
    (re.compile(r"b6\.7\s*360|isb.*360|360\s*hp", re.I), 360),
    (re.compile(r"godzilla|7\.3l", re.I), 350),
    (re.compile(r"power\s*stroke|6\.7l\s*diesel", re.I), 330),
    (re.compile(r"isb|b6\.7|~340|340\s*hp", re.I), 340),
    (re.compile(r"v10|triton|6\.8l", re.I), 320),
    (re.compile(r"ecoboost|3\.5l", re.I), 310),
    (re.compile(r"6\.2l", re.I), 385),
    (re.compile(r"6\.6l", re.I), 350),
    (re.compile(r"2\.0l\s*i4|~211|211\s*hp", re.I), 211),
    (re.compile(r"mercedes|sprinter", re.I), 188),
    (re.compile(r"ram\s*3\.6|3\.6l\s*v6", re.I), 280),
    (re.compile(r"chevy|chevrolet", re.I), 300),
    (re.compile(r"cummins", re.I), 360),
]


def infer_hp(engine: str | None) -> int | None:
    if not engine:
        return None
    m = re.search(r"(\d{2,4})\s*HP", engine, re.I)
    if m:
        return int(m.group(1))
    r = re.search(r"(\d{2,4})\s*[–—\-to]+\s*(\d{2,4})\s*HP", engine, re.I)
    if r:
        return int(round((int(r.group(1)) + int(r.group(2))) / 2))
    # multi option with two different families — pick primary (first) via patterns
    for pat, hp in HP_FROM_ENGINE:
        if pat.search(engine):
            return hp
    return None


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


def looks_gas_engine(engine: str) -> bool:
    e = engine.lower()
    if any(
        x in e
        for x in [
            "cummins",
            "isb",
            "b6.7",
            "l9",
            "isl",
            "x15",
            "x12",
            "power stroke",
            "duramax",
        ]
    ):
        return False
    return any(
        x in e
        for x in ["godzilla", "7.3", "triton", "v10", "f53", "f-53", "ecoboost"]
    )


def looks_diesel_engine(engine: str) -> bool:
    e = engine.lower()
    return any(
        x in e
        for x in [
            "cummins",
            "isb",
            "b6.7",
            "l9",
            "isl",
            "x15",
            "x12",
            "power stroke",
            "duramax",
            "diesel",
        ]
    )


def diesel_default(make: str, model: str, typ: str) -> tuple[str, int, str]:
    blob = f"{make} {model} {typ}".lower()
    if any(x in blob for x in ["king aire", "london aire", "essex"]):
        return ("Cummins X15 605HP", 605, "Spartan K3")
    if any(
        x in blob
        for x in ["dutch star", "mountain aire", "phaeton", "allegro bus", "aspire"]
    ):
        return ("Cummins L9 450HP", 450, "Freightliner XC")
    if "super c" in blob:
        return ("Ford Power Stroke 6.7L Diesel", 330, "Ford F-550")
    if "class b" in blob:
        return ("Mercedes-Benz diesel (Sprinter)", 188, "Mercedes-Benz Sprinter")
    return ("Cummins B6.7 360HP", 360, "Freightliner XC / XCR")


def make_name(m: re.Match[str]) -> str:
    return m.group(1) or m.group(2)


def model_name(m: re.Match[str]) -> str:
    return m.group(1) or m.group(2)


def iter_model_spans(src: str) -> list[dict]:
    makes = list(MAKE_RE.finditer(src))
    out: list[dict] = []
    for i, mk in enumerate(makes):
        m_start = mk.start()
        m_end = makes[i + 1].start() if i + 1 < len(makes) else src.rfind("};") + 1
        make_src = src[m_start:m_end]
        make = make_name(mk)
        models = list(MODEL_RE.finditer(make_src))
        for j, md in enumerate(models):
            rel = md.start()
            rel_end = models[j + 1].start() if j + 1 < len(models) else len(make_src)
            out.append(
                {
                    "make": make,
                    "model": model_name(md),
                    "abs": m_start + rel,
                    "abs_end": m_start + rel_end,
                }
            )
    return out


def get_str(block: str, field: str) -> str | None:
    m = re.search(rf'{field}:\s*"([^"]*)"', block)
    return m.group(1) if m else None


def get_num(block: str, field: str) -> int | None:
    m = re.search(rf"{field}:\s*(\d+)", block)
    return int(m.group(1)) if m else None


def set_engine(block: str, engine: str) -> str:
    if re.search(r'engine:\s*"[^"]*"', block):
        return re.sub(r'engine:\s*"[^"]*"', f'engine: "{engine}"', block, count=1)
    # insert after msrpRange block roughly after first type
    return re.sub(
        r'(type:\s*"[^"]*",\n)',
        rf'\1      engine: "{engine}",\n',
        block,
        count=1,
    )


def set_horsepower(block: str, hp: int) -> str:
    if re.search(r"horsepower:\s*\d+", block):
        return re.sub(r"horsepower:\s*\d+", f"horsepower: {hp}", block, count=1)
    if re.search(r'engine:\s*"[^"]*",\n', block):
        return re.sub(
            r'(engine:\s*"[^"]*",\n)',
            rf"\1      horsepower: {hp},\n",
            block,
            count=1,
        )
    return re.sub(
        r'(type:\s*"[^"]*",\n)',
        rf"\1      horsepower: {hp},\n",
        block,
        count=1,
    )


def set_str_field(block: str, field: str, value: str) -> str:
    if re.search(rf'{field}:\s*"[^"]*"', block):
        return re.sub(rf'{field}:\s*"[^"]*"', f'{field}: "{value}"', block, count=1)
    return block


def patch_bands(block: str) -> tuple[str, int]:
    changes = 0

    def repl(m: re.Match[str]) -> str:
        nonlocal changes
        fr, to, body = int(m.group(1)), int(m.group(2)), m.group(3)
        if to < 2016:
            return m.group(0)
        if re.search(r"horsepower:\s*\d+", body):
            return m.group(0)
        eng_m = re.search(r'engine:\s*"([^"]+)"', body)
        if not eng_m:
            return m.group(0)
        hp = infer_hp(eng_m.group(1))
        if hp is None:
            return m.group(0)
        new_body = re.sub(
            r'(engine:\s*"[^"]*",\n)',
            rf"\1          horsepower: {hp},\n",
            body,
            count=1,
        )
        changes += 1
        return "{ from: %d, to: %d,%s}" % (fr, to, new_body)

    new_block = re.sub(
        r"\{\s*from:\s*(\d+),\s*to:\s*(\d+),((?:[^{}]|\n)*)\}",
        repl,
        block,
    )
    return new_block, changes


def fix_block(make: str, model: str, block: str) -> tuple[str, list[str]]:
    notes: list[str] = []
    typ = get_str(block, "type") or ""
    fuel = get_str(block, "fuelType") or ""
    engine = get_str(block, "engine")
    hp = get_num(block, "horsepower")

    if is_towable(typ, fuel):
        return block, notes

    # Hard overrides
    if make == "Newmar" and model == "Kountry Star":
        block = set_str_field(block, "type", "Class A Diesel")
        block = set_str_field(block, "fuelType", "Diesel")
        block = set_engine(block, "Cummins B6.7 360HP")
        block = set_horsepower(block, 360)
        block = set_str_field(block, "chassis", "Freightliner XCR")
        notes.append("Kountry Star → Cummins B6.7 360 diesel")
        typ, fuel, engine, hp = "Class A Diesel", "Diesel", "Cummins B6.7 360HP", 360

    diesel_type = (
        ("diesel" in typ.lower() or "diesel" in fuel.lower())
        and "gas" not in fuel.lower()
        and "/" not in fuel
        and "by plan" not in fuel.lower()
        and "by chassis" not in fuel.lower()
        and "by year" not in fuel.lower()
    )
    gas_type = (
        ("gas" in typ.lower() or fuel.lower() == "gas")
        and "diesel" not in typ.lower()
        and "diesel" not in fuel.lower()
    )

    engine = get_str(block, "engine")
    hp = get_num(block, "horsepower")

    if (
        engine
        and diesel_type
        and looks_gas_engine(engine)
        and not looks_diesel_engine(engine)
    ):
        eng, nhp, ch = diesel_default(make, model, typ)
        block = set_engine(block, eng)
        block = set_horsepower(block, nhp)
        block = set_str_field(block, "chassis", ch)
        block = set_str_field(block, "fuelType", "Diesel")
        notes.append(f"diesel-type gas eng → {eng}/{nhp}")
        engine, hp = eng, nhp

    if (
        engine
        and gas_type
        and looks_diesel_engine(engine)
        and "class b" not in typ.lower()
        and " / " not in engine
        and "by year" not in engine.lower()
        and "by chassis" not in engine.lower()
        and "by plan" not in engine.lower()
        and "by era" not in engine.lower()
        and "select" not in engine.lower()
    ):
        # pure diesel string on pure gas type — rare; leave duals alone
        pass

    engine = get_str(block, "engine")
    hp = get_num(block, "horsepower")
    if engine and hp is None:
        inferred = infer_hp(engine)
        if inferred is not None:
            block = set_horsepower(block, inferred)
            notes.append(f"filled HP {inferred}")
            hp = inferred

    block2, n = patch_bands(block)
    if n:
        notes.append(f"band HP +{n}")
        block = block2

    return block, notes


def regenerate_export(src: str) -> dict:
    models = []
    for span in iter_model_spans(src):
        block = src[span["abs"] : span["abs_end"]]
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
            {int(y) for y in re.findall(r'"(\d{4})":\s*\[', block) if 1990 <= int(y) <= 2030}
        )
        # floorplansByYear keys only — crude: also match "YYYY":
        years2 = sorted(
            {
                int(y)
                for y in re.findall(r'\n\s+"(\d{4})":\s*\[', block)
                if 1990 <= int(y) <= 2030
            }
        )
        years = years2 or years
        lr = re.search(r"lengthRange:\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]", block)
        wr = re.search(r"weightRange:\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]", block)
        sleeps = get_num(block, "sleeps")
        slides = get_num(block, "slideouts")
        rating_m = re.search(r"rating:\s*([0-9.]+)", block)
        models.append(
            {
                "make": span["make"],
                "model": span["model"],
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
            }
        )
    makes = sorted({m["make"] for m in models})
    return {
        "exportedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "src/lib/rv/rvData.ts",
        "makeCount": len(makes),
        "modelCount": len(models),
        "models": sorted(models, key=lambda x: (x["make"].lower(), x["model"].lower())),
    }


def main() -> None:
    src = RVDATA.read_text()
    spans = iter_model_spans(src)
    print(f"Found {len(spans)} models")
    replacements: list[tuple[int, int, str]] = []
    notes_all: list[str] = []
    for sp in spans:
        block = src[sp["abs"] : sp["abs_end"]]
        new_block, notes = fix_block(sp["make"], sp["model"], block)
        if new_block != block:
            replacements.append((sp["abs"], sp["abs_end"], new_block))
            for n in notes:
                notes_all.append(f"{sp['make']}/{sp['model']}: {n}")

    replacements.sort(key=lambda x: x[0], reverse=True)
    out = src
    for a, b, nb in replacements:
        out = out[:a] + nb + out[b:]
    if out != src:
        RVDATA.write_text(out)
        print(f"Wrote rvData.ts — {len(replacements)} models updated")
    else:
        print("No model text changes")
    print(f"Change notes: {len(notes_all)}")
    for n in notes_all[:60]:
        print(" -", n)

    src2 = RVDATA.read_text()
    payload = regenerate_export(src2)
    EXPORTS.mkdir(exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    for name in ["rvfax-catalog-models.json", f"rvfax-catalog-models-{stamp}.json"]:
        (EXPORTS / name).write_text(json.dumps(payload, indent=2) + "\n")

    fields = [
        "make",
        "model",
        "type",
        "fuelType",
        "engine",
        "horsepower",
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
    for name in ["rvfax-catalog-models.csv", f"rvfax-catalog-models-{stamp}.csv"]:
        with (EXPORTS / name).open("w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
            w.writeheader()
            for m in payload["models"]:
                w.writerow(m)

    lines = [
        f"RvFACTS catalog powertrain — {payload['exportedAt']}",
        f"Makes {payload['makeCount']} · Models {payload['modelCount']}",
        "",
        "Motorized (yearEnd>=2016) engine / HP:",
    ]
    for m in payload["models"]:
        ye = m.get("yearEnd") or 2026
        if ye < 2016:
            continue
        typ = (m.get("type") or "").lower()
        fuel = (m.get("fuelType") or "").lower()
        if any(
            x in typ or x in fuel
            for x in ["travel trailer", "fifth", "toy hauler", "truck camper", "towable"]
        ):
            continue
        lines.append(
            f"- {m['make']} {m['model']}: {m.get('engine') or '—'} | HP={m.get('horsepower')} | {m.get('fuelType')} | {m.get('type')}"
        )
    for name in ["rvfax-catalog-models.txt", f"rvfax-catalog-models-{stamp}.txt"]:
        (EXPORTS / name).write_text("\n".join(lines) + "\n")

    ks = next(
        m
        for m in payload["models"]
        if m["make"] == "Newmar" and m["model"] == "Kountry Star"
    )
    print("Kountry Star export:", ks["engine"], ks["horsepower"], ks["type"], ks["fuelType"])
    assert "Cummins" in (ks["engine"] or "")
    assert ks["horsepower"] == 360

    motor_null = [
        m
        for m in payload["models"]
        if m.get("horsepower") is None
        and m.get("engine")
        and not is_towable(m.get("type") or "", m.get("fuelType") or "")
    ]
    print("motorized null HP remaining:", len(motor_null))
    for m in motor_null:
        print("  ", m["make"], m["model"], m.get("engine"))

    bad = [
        m
        for m in payload["models"]
        if (
            "diesel" in (m.get("type") or "").lower()
            or "diesel" in (m.get("fuelType") or "").lower()
        )
        and m.get("engine")
        and looks_gas_engine(m["engine"])
        and not looks_diesel_engine(m["engine"])
    ]
    print("diesel-type gas-engine remaining:", len(bad))
    for m in bad:
        print("  ", m["make"], m["model"], m["engine"])

    print("Export modelCount", payload["modelCount"], "makeCount", payload["makeCount"])


if __name__ == "__main__":
    main()
