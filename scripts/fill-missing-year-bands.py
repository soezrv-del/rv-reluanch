#!/usr/bin/env python3
"""
Phase 5.2 — add powertrainByYear for motorized models that still lack bands.
Uses top-level engine/HP/chassis and era-aware splits for common chassis families.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path("/workspace")
RVDATA = ROOT / "src/lib/rv/rvData.ts"

MAKE_RE = re.compile(r'^  (?:"([^"]+)"|([A-Za-z][A-Za-z0-9 &\.\-]+)):\s*\{', re.M)
MODEL_RE = re.compile(
    r'^    (?:"([^"]+)"|([A-Za-z0-9][A-Za-z0-9 /+\.\-]*)):\s*\{', re.M
)


def is_motorized(typ: str, fuel: str) -> bool:
    t = f"{typ} {fuel}".lower()
    if any(
        x in t
        for x in (
            "travel trailer",
            "fifth wheel",
            "toy hauler",
            "truck camper",
            "towable",
        )
    ):
        return False
    return bool(re.search(r"class|super c|motorhome", t))


def infer_hp(engine: str | None, top_hp: int | None) -> int | None:
    if top_hp and top_hp > 0:
        return top_hp
    if not engine:
        return None
    m = re.search(r"(\d{2,4})\s*HP", engine, re.I)
    if m:
        return int(m.group(1))
    rules = [
        (r"x15|605", 605),
        (r"l9|isl.*450|450\s*hp", 450),
        (r"godzilla|7\.3", 350),
        (r"power\s*stroke|6\.7l\s*diesel", 330),
        (r"b6\.7|isb", 360),
        (r"v10|triton", 320),
        (r"ecoboost|3\.5l", 310),
        (r"2\.0l\s*i4|211", 211),
        (r"mercedes|sprinter", 188),
        (r"ram\s*3\.6|3\.6l\s*v6", 280),
        (r"cummins", 360),
    ]
    for pat, hp in rules:
        if re.search(pat, engine, re.I):
            return hp
    return None


def year_span(block: str) -> tuple[int, int]:
    years = [int(y) for y in re.findall(r'"(20\d{2})":\s*\[', block)]
    if years:
        return min(years), max(years)
    return 2016, 2026


def build_bands(
    engine: str,
    hp: int | None,
    chassis: str | None,
    transmission: str | None,
    typ: str,
    fuel: str,
    y0: int,
    y1: int,
) -> list[dict]:
    """Era-aware bands for common chassis; single band fallback."""
    eng = engine or "See chassis"
    ch = chassis or ""
    bands: list[dict] = []

    def band(a: int, b: int, e: str, h: int | None, c: str | None = None, tr: str | None = None):
        if a > b:
            return
        item: dict = {"from": a, "to": b, "engine": e}
        if h:
            item["horsepower"] = h
        if c:
            item["chassis"] = c
        if tr:
            item["transmission"] = tr
        bands.append(item)

    # Sprinter diesel Class B/B+
    if re.search(r"mercedes|sprinter", eng + ch, re.I) and re.search(
        r"class b", typ, re.I
    ):
        # early OM651 ~161–188; modern OM654 ~170–211
        if y0 < 2019:
            band(y0, min(2018, y1), "Mercedes-Benz turbodiesel (Sprinter)", min(hp or 188, 188), ch or "Mercedes-Benz Sprinter", transmission)
        if y1 >= 2019:
            band(max(y0, 2019), y1, eng if "2.0" in eng or "I4" in eng else "Mercedes-Benz 2.0L I4 turbodiesel", hp or 208, ch or "Mercedes-Benz Sprinter", transmission)
        if bands:
            return bands

    # Ford Transit EcoBoost / multi
    if re.search(r"transit|ecoboost", eng + ch, re.I):
        band(y0, y1, eng, hp or 310, ch or "Ford Transit", transmission)
        return bands

    # RAM Promaster gas
    if re.search(r"ram\s*3\.6|promaster|3\.6l\s*v6", eng + ch, re.I):
        band(y0, y1, eng, hp or 280, ch or "RAM ProMaster", transmission)
        return bands

    # Class A gas F53 — V10 era vs Godzilla
    if re.search(r"class a", typ, re.I) and re.search(r"gas", fuel, re.I):
        if re.search(r"godzilla|7\.3", eng, re.I) or y1 >= 2021:
            if y0 <= 2020:
                band(y0, min(2020, y1), "Ford Triton V10 6.8L", 320, ch or "Ford F53", transmission or "TorqShift 6-spd Auto")
            if y1 >= 2021:
                band(max(y0, 2021), y1, eng if re.search(r"godzilla|7\.3", eng, re.I) else "Ford 7.3L V8 Godzilla", hp or 350, ch or "Ford F53", transmission or "TorqShift 6-spd Auto")
            if bands:
                return bands
        band(y0, y1, eng, hp or 320, ch or "Ford F53", transmission)
        return bands

    # Super C Power Stroke
    if re.search(r"super c|power stroke|f-?55|f-?6", typ + eng + ch, re.I):
        band(y0, y1, eng, hp or 330, ch or chassis, transmission)
        return bands

    # Diesel Class A L9 / ISB
    if re.search(r"diesel", fuel, re.I) and re.search(r"class a", typ, re.I):
        if re.search(r"l9|isl|450", eng, re.I):
            band(y0, y1, eng, hp or 450, ch, transmission or "Allison 3000 MH")
            return bands
        band(y0, y1, eng, hp or 360, ch, transmission or "Allison 3000 MH")
        return bands

    # Default single band covering known floorplan years
    band(y0, y1, eng, hp, ch or None, transmission)
    return bands


def format_bands_ts(bands: list[dict], indent: str = "      ") -> str:
    lines = [f"{indent}powertrainByYear: ["]
    for b in bands:
        parts = [f"from: {b['from']}", f"to: {b['to']}", f'engine: "{b["engine"]}"']
        if b.get("horsepower"):
            parts.append(f"horsepower: {b['horsepower']}")
        if b.get("chassis"):
            parts.append(f'chassis: "{b["chassis"]}"')
        if b.get("transmission"):
            parts.append(f'transmission: "{b["transmission"]}"')
        lines.append(f"{indent}  {{ {', '.join(parts)} }},")
    lines.append(f"{indent}],")
    return "\n".join(lines)


def main() -> None:
    src = RVDATA.read_text(encoding="utf-8")
    start = src.find("export const RV_DATA")
    if start < 0:
        start = src.find("const RV_DATA")
    # Work only inside RV_DATA for safety
    head = src[:start]
    body = src[start:]
    makes = list(MAKE_RE.finditer(body))
    inserts: list[tuple[int, int, str]] = []  # start, end of model block relative body, new block
    filled = 0

    for i, mk in enumerate(makes):
        make = mk.group(1) or mk.group(2)
        end = makes[i + 1].start() if i + 1 < len(makes) else len(body)
        mchunk = body[mk.start() : end]
        models = list(MODEL_RE.finditer(mchunk))
        for j, md in enumerate(models):
            model = md.group(1) or md.group(2)
            m0 = md.start()
            m1 = models[j + 1].start() if j + 1 < len(models) else len(mchunk)
            block = mchunk[m0:m1]
            if "powertrainByYear:" in block:
                continue
            typ_m = re.search(r'type:\s*"([^"]+)"', block)
            fuel_m = re.search(r'fuelType:\s*"([^"]+)"', block)
            typ = typ_m.group(1) if typ_m else ""
            fuel = fuel_m.group(1) if fuel_m else ""
            if not is_motorized(typ, fuel):
                continue
            eng_m = re.search(r'engine:\s*"([^"]+)"', block)
            hp_m = re.search(r"horsepower:\s*(\d+)", block)
            ch_m = re.search(r'chassis:\s*"([^"]+)"', block)
            tr_m = re.search(r'transmission:\s*"([^"]+)"', block)
            engine = eng_m.group(1) if eng_m else "See chassis"
            hp = infer_hp(engine, int(hp_m.group(1)) if hp_m else None)
            chassis = ch_m.group(1) if ch_m else None
            transmission = tr_m.group(1) if tr_m else None
            y0, y1 = year_span(block)
            bands = build_bands(engine, hp, chassis, transmission, typ, fuel, y0, y1)
            if not bands:
                continue
            band_ts = format_bands_ts(bands)
            # Insert after horsepower if present, else after engine, else after fuelType
            insert_at = None
            for pat in (
                r"horsepower:\s*\d+,?\n",
                r'engine:\s*"[^"]+",?\n',
                r'fuelType:\s*"[^"]+",?\n',
            ):
                m = re.search(pat, block)
                if m:
                    insert_at = m.end()
                    break
            if insert_at is None:
                # before image:
                m = re.search(r"image:\s*RV_CARD_IMAGE", block)
                if m:
                    insert_at = m.start()
            if insert_at is None:
                print(f"SKIP no insert point: {make} {model}")
                continue
            new_block = block[:insert_at] + band_ts + "\n" + block[insert_at:]
            abs0 = mk.start() + m0
            abs1 = mk.start() + m1
            inserts.append((abs0, abs1, new_block))
            filled += 1
            print(f"FILL {make} | {model} | bands={len(bands)} | {y0}-{y1} | {engine} | hp={hp}")

    # Apply inserts from end to start
    inserts.sort(key=lambda x: x[0], reverse=True)
    out_body = body
    for a, b, nb in inserts:
        out_body = out_body[:a] + nb + out_body[b:]

    if filled:
        RVDATA.write_text(head + out_body, encoding="utf-8")
    print(f"filled {filled} models")


if __name__ == "__main__":
    main()
