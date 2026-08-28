#!/usr/bin/env python3
"""
Import attachments/rvfax-catalog-models-corrected.json into src/lib/rv/rvData.ts.

Updates top-level engine / horsepower / chassis / fuelType / type / rating /
sleeps / slideouts / lengthRange / weightRange when models match.

Preserves powertrainByYear bands (year-true) and critical verified overrides
that the team export still has wrong (Kountry Star diesel, Phaeton 380, etc.).
"""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path("/workspace")
RVDATA = ROOT / "src/lib/rv/rvData.ts"
CORRECTED = ROOT / "attachments/rvfax-catalog-models-corrected.json"
EXPORTS = ROOT / "exports"
BACKUP = ROOT / "exports/rvData.pre-import-corrected.ts.bak"

MAKE_RE = re.compile(r'^  (?:"([^"]+)"|([A-Za-z][A-Za-z0-9 &\.\-]+)):\s*\{', re.M)
MODEL_RE = re.compile(
    r'^    (?:"([^"]+)"|([A-Za-z0-9][A-Za-z0-9 /+\.\-]*)):\s*\{', re.M
)

# Team export still wrong — force after import (brochure / prior audit)
FORCE: dict[tuple[str, str], dict] = {
    ("Newmar", "Kountry Star"): {
        "type": "Class A Diesel",
        "fuelType": "Diesel",
        "engine": "Cummins B6.7 360HP",
        "horsepower": 360,
        "chassis": "Freightliner XCR",
    },
    ("Tiffin", "Phaeton"): {
        "type": "Class A Diesel",
        "fuelType": "Diesel",
        "engine": "Cummins L9 380HP",
        "horsepower": 380,
        "chassis": "Freightliner / Tiffin PowerGlide (by option)",
    },
    ("Forest River", "FR3"): {
        "type": "Class A Gas",
        "fuelType": "Gas",
        "engine": "Ford 7.3L V8 Godzilla",
        "horsepower": 335,
        "chassis": "Ford F53",
    },
}


def esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def set_str_field(block: str, key: str, value: str | None) -> str:
    if value is None:
        return block
    # skip towable N/A engines as empty? keep explicit null by removing field? keep as-is
    pat = re.compile(rf'^(\s*){key}:\s*"[^"]*"', re.M)
    if pat.search(block):
        return pat.sub(rf'\1{key}: "{esc(value)}"', block, count=1)
    # insert after type: if present
    m = re.search(r'^(\s*)type:\s*"[^"]*",?\n', block, re.M)
    if m and key != "type":
        indent = m.group(1)
        return (
            block[: m.end()]
            + f'{indent}{key}: "{esc(value)}",\n'
            + block[m.end() :]
        )
    return block


def set_num_field(block: str, key: str, value: int | float | None) -> str:
    if value is None:
        return block
    # null horsepower in export with engine text — skip writing null over good
    pat = re.compile(rf"^(\s*){key}:\s*\d+", re.M)
    if pat.search(block):
        return pat.sub(rf"\1{key}: {int(value)}", block, count=1)
    # insert after engine if horsepower
    if key == "horsepower":
        m = re.search(r'^(\s*)engine:\s*"[^"]*",?\n', block, re.M)
        if m:
            indent = m.group(1)
            return (
                block[: m.end()]
                + f"{indent}horsepower: {int(value)},\n"
                + block[m.end() :]
            )
    return block


def apply_fields(block: str, fields: dict) -> str:
    out = block
    if "type" in fields and fields["type"]:
        out = set_str_field(out, "type", fields["type"])
    if "fuelType" in fields and fields["fuelType"]:
        ft = fields["fuelType"]
        if ft and not ft.startswith("N/A"):
            out = set_str_field(out, "fuelType", ft)
    if "engine" in fields:
        eng = fields["engine"]
        if eng is None:
            pass  # leave existing for towables that already have no engine
        else:
            out = set_str_field(out, "engine", eng)
    if "horsepower" in fields and fields["horsepower"] is not None:
        out = set_num_field(out, "horsepower", fields["horsepower"])
    if "chassis" in fields and fields["chassis"]:
        ch = fields["chassis"]
        if not str(ch).startswith("N/A"):
            out = set_str_field(out, "chassis", ch)
    if "rating" in fields and fields["rating"] is not None:
        out = set_num_field(out, "rating", fields["rating"])
    if "sleeps" in fields and fields["sleeps"] is not None:
        out = set_num_field(out, "sleeps", fields["sleeps"])
    if "slideouts" in fields and fields["slideouts"] is not None:
        out = set_num_field(out, "slideouts", fields["slideouts"])
    # length / weight ranges
    if fields.get("lengthMinFt") is not None and fields.get("lengthMaxFt") is not None:
        out = re.sub(
            r"lengthRange:\s*\[\s*\d+\s*,\s*\d+\s*\]",
            f"lengthRange: [\n        {int(fields['lengthMinFt'])},\n        {int(fields['lengthMaxFt'])}\n      ]",
            out,
            count=1,
        )
    if fields.get("weightMinLbs") is not None and fields.get("weightMaxLbs") is not None:
        out = re.sub(
            r"weightRange:\s*\[\s*\d+\s*,\s*\d+\s*\]",
            f"weightRange: [\n        {int(fields['weightMinLbs'])},\n        {int(fields['weightMaxLbs'])}\n      ]",
            out,
            count=1,
        )
    return out


def main() -> None:
    data = json.loads(CORRECTED.read_text(encoding="utf-8"))
    models = data["models"]
    by_key = {(m["make"], m["model"]): m for m in models}

    src = RVDATA.read_text(encoding="utf-8")
    EXPORTS.mkdir(parents=True, exist_ok=True)
    shutil.copy2(RVDATA, BACKUP)

    start = src.find("export const RV_DATA")
    if start < 0:
        start = src.find("const RV_DATA")
    head, body = src[:start], src[start:]

    makes = list(MAKE_RE.finditer(body))
    updates = 0
    missing = []
    inserts: list[tuple[int, int, str]] = []

    for i, mk in enumerate(makes):
        make = mk.group(1) or mk.group(2)
        end = makes[i + 1].start() if i + 1 < len(makes) else len(body)
        mchunk = body[mk.start() : end]
        models_m = list(MODEL_RE.finditer(mchunk))
        for j, md in enumerate(models_m):
            model = md.group(1) or md.group(2)
            m0, m1 = md.start(), (
                models_m[j + 1].start() if j + 1 < len(models_m) else len(mchunk)
            )
            block = mchunk[m0:m1]
            corr = by_key.get((make, model))
            if not corr:
                missing.append(f"{make} | {model}")
                continue
            fields = {
                "type": corr.get("type"),
                "fuelType": corr.get("fuelType"),
                "engine": corr.get("engine"),
                "horsepower": corr.get("horsepower"),
                "chassis": corr.get("chassis"),
                "rating": corr.get("rating"),
                "sleeps": corr.get("sleeps"),
                "slideouts": corr.get("slideouts"),
                "lengthMinFt": corr.get("lengthMinFt"),
                "lengthMaxFt": corr.get("lengthMaxFt"),
                "weightMinLbs": corr.get("weightMinLbs"),
                "weightMaxLbs": corr.get("weightMaxLbs"),
            }
            # Force verified overrides
            if (make, model) in FORCE:
                fields.update(FORCE[(make, model)])
            new_block = apply_fields(block, fields)
            if new_block != block:
                abs0 = mk.start() + m0
                abs1 = mk.start() + m1
                inserts.append((abs0, abs1, new_block))
                updates += 1

    inserts.sort(key=lambda x: x[0], reverse=True)
    out_body = body
    for a, b, nb in inserts:
        out_body = out_body[:a] + nb + out_body[b:]

    RVDATA.write_text(head + out_body, encoding="utf-8")

    # Copy corrected export into exports as active catalog export
    shutil.copy2(CORRECTED, EXPORTS / "rvfax-catalog-models-corrected.json")
    shutil.copy2(CORRECTED, EXPORTS / "rvfax-catalog-models.json")

    # Write merge report
    report = {
        "importedFrom": str(CORRECTED),
        "modelCountInFile": len(models),
        "blocksUpdated": updates,
        "notInRvData": missing[:50],
        "notInRvDataCount": len(missing),
        "forcedOverrides": [f"{a} {b}" for a, b in FORCE],
        "note": data.get("correctionsNote"),
        "lastVerified": data.get("lastVerified"),
    }
    (EXPORTS / "catalog-import-report.json").write_text(
        json.dumps(report, indent=2), encoding="utf-8"
    )
    print(json.dumps(report, indent=2))
    print(f"backup {BACKUP}")
    print(f"updated rvData.ts blocks={updates}")


if __name__ == "__main__":
    main()
