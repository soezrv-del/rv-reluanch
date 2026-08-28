#!/usr/bin/env python3
"""Phase 5.1 — gap report: motorized models missing year-bands or null HP."""

from __future__ import annotations

import csv
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/workspace")
RVDATA = ROOT / "src/lib/rv/rvData.ts"
EXPORTS = ROOT / "exports"

MAKE_RE = re.compile(r'^  (?:"([^"]+)"|([A-Za-z][A-Za-z0-9 &\.\-]+)):\s*\{', re.M)
MODEL_RE = re.compile(
    r'^    (?:"([^"]+)"|([A-Za-z0-9][A-Za-z0-9 /+\.\-]*)):\s*\{', re.M
)


def is_motorized(typ: str, fuel: str) -> bool:
    t = f"{typ} {fuel}".lower()
    if any(x in t for x in ("travel trailer", "fifth wheel", "toy hauler", "truck camper", "towable")):
        return False
    return bool(re.search(r"class|super c|motorhome", t))


def main() -> None:
    src = RVDATA.read_text(encoding="utf-8")
    start = src.find("export const RV_DATA")
    if start < 0:
        start = src.find("const RV_DATA")
    chunk = src[start:]
    makes = list(MAKE_RE.finditer(chunk))
    rows: list[dict] = []

    for i, mk in enumerate(makes):
        make = mk.group(1) or mk.group(2)
        end = makes[i + 1].start() if i + 1 < len(makes) else len(chunk)
        mchunk = chunk[mk.start() : end]
        models = list(MODEL_RE.finditer(mchunk))
        for j, md in enumerate(models):
            model = md.group(1) or md.group(2)
            mend = models[j + 1].start() if j + 1 < len(models) else len(mchunk)
            b = mchunk[md.start() : mend]
            typ_m = re.search(r'type:\s*"([^"]+)"', b)
            fuel_m = re.search(r'fuelType:\s*"([^"]+)"', b)
            typ = typ_m.group(1) if typ_m else ""
            fuel = fuel_m.group(1) if fuel_m else ""
            if not is_motorized(typ, fuel):
                continue
            eng_m = re.search(r'engine:\s*"([^"]+)"', b)
            hp_m = re.search(r"horsepower:\s*(\d+)", b)
            has_bands = "powertrainByYear:" in b
            bands = []
            for bm in re.finditer(
                r"\{\s*from:\s*(\d+),\s*to:\s*(\d+),((?:[^{}]|\n)*)\}", b
            ):
                body = bm.group(3)
                e = re.search(r'engine:\s*"([^"]+)"', body)
                h = re.search(r"horsepower:\s*(\d+)", body)
                bands.append(
                    {
                        "from": int(bm.group(1)),
                        "to": int(bm.group(2)),
                        "engine": e.group(1) if e else None,
                        "horsepower": int(h.group(1)) if h else None,
                    }
                )
            null_band_hp = any(x["horsepower"] is None for x in bands) if bands else False
            top_hp = int(hp_m.group(1)) if hp_m else None
            gaps = []
            if not has_bands:
                gaps.append("missing_year_bands")
            if top_hp is None and (not bands or null_band_hp):
                gaps.append("null_horsepower")
            if null_band_hp:
                gaps.append("band_missing_hp")
            rows.append(
                {
                    "make": make,
                    "model": model,
                    "type": typ,
                    "fuelType": fuel,
                    "engine": eng_m.group(1) if eng_m else None,
                    "topHorsepower": top_hp,
                    "hasYearBands": has_bands,
                    "bandCount": len(bands),
                    "bands": bands,
                    "gaps": gaps,
                    "status": "gap" if gaps else "ok",
                }
            )

    gap_rows = [r for r in rows if r["status"] == "gap"]
    EXPORTS.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "motorizedTotal": len(rows),
        "gapCount": len(gap_rows),
        "okCount": len(rows) - len(gap_rows),
        "missingYearBands": sum(1 for r in gap_rows if "missing_year_bands" in r["gaps"]),
        "nullHorsepower": sum(1 for r in gap_rows if "null_horsepower" in r["gaps"]),
        "models": rows,
        "gapsOnly": gap_rows,
    }
    out_json = EXPORTS / "rvfax-catalog-powertrain-gaps.json"
    out_csv = EXPORTS / "rvfax-catalog-powertrain-gaps.csv"
    out_json.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    # dated copy
    (EXPORTS / f"rvfax-catalog-powertrain-gaps-{stamp}.json").write_text(
        json.dumps(payload, indent=2), encoding="utf-8"
    )

    with out_csv.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(
            [
                "make",
                "model",
                "type",
                "fuelType",
                "engine",
                "topHorsepower",
                "hasYearBands",
                "bandCount",
                "gaps",
                "status",
            ]
        )
        for r in rows:
            w.writerow(
                [
                    r["make"],
                    r["model"],
                    r["type"],
                    r["fuelType"],
                    r["engine"] or "",
                    r["topHorsepower"] if r["topHorsepower"] is not None else "",
                    r["hasYearBands"],
                    r["bandCount"],
                    "|".join(r["gaps"]),
                    r["status"],
                ]
            )

    print(
        f"motorized={len(rows)} gaps={len(gap_rows)} "
        f"missing_bands={payload['missingYearBands']} null_hp={payload['nullHorsepower']}"
    )
    print(f"wrote {out_json}")
    print(f"wrote {out_csv}")


if __name__ == "__main__":
    main()
