#!/usr/bin/env python3
"""Rich RV Country own-lot scrape. Python stdlib only. No paid services, no /api/.

Reads https://rvcountry.com/vehicle-sitemap.xml and srp-sitemap.xml, then each
/inventory/{slug} page, and writes the embedded unit (initialItem or units) in
the same shape as public/inventory/own-lot-latest.json.

    python3 scripts/scrape_rvcountry_rich.py --max 5 --out /tmp/own-lot-smoke.json
    python3 scripts/scrape_rvcountry_rich.py

Default output is OWN_LOT_INVENTORY_PATH, else the publisher upstream path.
Then: node scripts/publish-own-lot.mjs
Publishing also writes public/inventory/own-lot-fulltext.json.

Resume: every fetched page is appended to a checkpoint (default
<out>.partial.jsonl). A run that is killed (an agent session ending, a
reboot) picks up where it stopped on the next start, keeping the first
run's scraped_at, as long as that checkpoint is under --resume-max-age-hours
(default 6) old. Older checkpoints are discarded and the scrape starts over.
The sitemaps are always re-read, so a unit sold since the first run is not
kept. The checkpoint is deleted after a successful write. --no-resume
ignores it.

User-Agent is fixed. 2.5s between requests. Stops on 403, 429, 503, or a
Cloudflare challenge and does not write a partial file. Drops a row that is
missing raw.attributes and logs its stock number and URL. Refuses to write
only when more than 2% of rows are missing raw.attributes, or the kept total
is under 1,200 units.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

USER_AGENT = "RVFoxInventoryBot/1.0 (+own-lot inventory for RV Country staff)"
PACE_SECONDS = 2.5
VEHICLE_SITEMAP = "https://rvcountry.com/vehicle-sitemap.xml"
SRP_SITEMAP = "https://rvcountry.com/srp-sitemap.xml"
DEFAULT_OUT = "/home/box/agent-data/projects/rvfox/inventory/own-lot-latest.json"
DEFAULT_MAX_MISSING_RATIO = 0.02
DEFAULT_MIN_UNITS = 1200
DEFAULT_RESUME_MAX_AGE_HOURS = 6
KEEP_NULL = {"price", "price_msrp", "price_current", "price_hidden", "price_lowest"}


class ScrapeBlocked(Exception):
    pass


class ScrapeFailed(Exception):
    pass


def is_api_url(url: str) -> bool:
    try:
        path = urlparse(url).path or ""
    except ValueError:
        path = str(url)
    return path == "/api" or path.startswith("/api/")


def inventory_urls_from_sitemap(xml: str) -> list[str]:
    urls: list[str] = []
    seen: set[str] = set()
    for loc in re.findall(r"<loc>\s*([^<]+)\s*</loc>", xml or ""):
        parsed = urlparse(loc.strip())
        if parsed.hostname not in {"rvcountry.com", "www.rvcountry.com"}:
            continue
        if is_api_url(parsed.geturl()):
            continue
        if not re.fullmatch(r"/inventory/[^/]+", parsed.path or ""):
            continue
        href = f"https://rvcountry.com{parsed.path}"
        if href in seen:
            continue
        seen.add(href)
        urls.append(href)
    return urls


def is_blocked_response(status: int, body: str = "") -> bool:
    if status in {403, 429, 503}:
        return True
    text = body or ""
    challenge = re.search(
        r"Just a moment|cf-browser-verification|Attention Required|challenge-platform|cdn-cgi/challenge",
        text,
        re.I,
    )
    return bool(challenge) and not re.search(r"initialItem|stock_number", text)


def flight_text(html: str) -> str:
    parts: list[str] = []
    for match in re.finditer(r"self\.__next_f\.push\((\[.*?\])\)\s*</script>", html or "", re.S):
        try:
            arr = json.loads(match.group(1))
        except json.JSONDecodeError:
            continue
        if isinstance(arr, list) and len(arr) >= 2 and isinstance(arr[1], str):
            parts.append(arr[1])
    return "".join(parts) if parts else (html or "")


def slice_json_value(text: str, start: int):
    i = start
    while i < len(text) and text[i].isspace():
        i += 1
    if i >= len(text) or text[i] not in "{[":
        return None
    open_ch = text[i]
    close_ch = "}" if open_ch == "{" else "]"
    depth = 0
    in_str = False
    esc = False
    for j in range(i, len(text)):
        ch = text[j]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
        elif ch == open_ch:
            depth += 1
        elif ch == close_ch:
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(text[i : j + 1])
                except json.JSONDecodeError:
                    return None
    return None


def extract_embedded_units(html: str) -> list[dict]:
    text = flight_text(html)
    found: list[dict] = []
    seen: set[str] = set()

    def push(unit) -> None:
        if not isinstance(unit, dict):
            return
        stock = str(unit.get("stock_number") or unit.get("id") or "").strip()
        if not stock or stock in seen:
            return
        seen.add(stock)
        found.append(unit)

    for match in re.finditer(r'"initialItem"\s*:', text):
        value = slice_json_value(text, match.end())
        if isinstance(value, dict):
            push(value)
    for match in re.finditer(r'"units"\s*:', text):
        value = slice_json_value(text, match.end())
        if isinstance(value, list):
            for unit in value:
                push(unit)
    return found


def name_of(value) -> str:
    if isinstance(value, str):
        return "" if value.startswith("$") else value.strip()
    if isinstance(value, dict) and isinstance(value.get("name"), str):
        return "" if value["name"].startswith("$") else value["name"].strip()
    return ""


def pick_name(*values) -> str:
    for value in values:
        name = name_of(value)
        if name:
            return name
    return ""


def num(value):
    if value is None or value == "":
        return None
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return float(value) if isinstance(value, float) else value
    try:
        text = str(value).replace(",", "").strip()
        if not text:
            return None
        number = float(text)
    except ValueError:
        return None
    if number.is_integer():
        return int(number)
    return number


def positive(value):
    number = num(value)
    if number is None or number <= 0:
        return None
    return number


def count_or_null(value):
    number = num(value)
    if number is None or number < 0:
        return None
    return number


def text_or_none(value):
    if not isinstance(value, str):
        return None
    text = value.strip()
    if not text or text.startswith("$"):
        return None
    return text


def raw_of(item: dict) -> dict:
    raw = item.get("_raw")
    return raw if isinstance(raw, dict) else {}


def spec_sheet(raw: dict) -> tuple[dict, list]:
    groups: dict[str, list] = {}
    for attr in raw.get("inventory_unit_attributes") or []:
        if not isinstance(attr, dict):
            continue
        name = str(attr.get("name") or "").strip()
        if not name:
            continue
        groups.setdefault(name, []).append(attr)
    attributes: dict[str, str] = {}
    flags: list[str] = []
    for name, items in groups.items():
        pieces: list[str] = []
        for attr in items:
            brand = attr.get("brand_value")
            piece = attr.get("value") if brand in (None, "") else brand
            if piece is None:
                continue
            text = str(piece).strip()
            if text and text not in pieces:
                pieces.append(text)
        if pieces and all(piece == name for piece in pieces):
            flags.append(name)
            continue
        if pieces:
            attributes[name] = " | ".join(pieces)
    flags.sort()
    return attributes, flags


def attr_value(raw: dict, name: str) -> str:
    for attr in raw.get("inventory_unit_attributes") or []:
        if not isinstance(attr, dict) or attr.get("name") != name or attr.get("value") is None:
            continue
        text = str(attr.get("value")).strip()
        if text:
            return text
    return ""


def propane_of(raw: dict) -> tuple:
    propane_lbs = None
    propane_gal = None
    for attr in raw.get("inventory_unit_attributes") or []:
        if not isinstance(attr, dict) or attr.get("name") != "Total Propane Tank Capacity":
            continue
        number = num(attr.get("value"))
        if number is None or number <= 0:
            continue
        unit = str(attr.get("measure_unit") or "").lower()
        if unit.startswith("lb"):
            propane_lbs = number
        elif unit.startswith("gal"):
            propane_gal = number
    return propane_lbs, propane_gal


def string_list(value) -> list[str]:
    if not isinstance(value, list):
        return []
    out: list[str] = []
    for item in value:
        text = item.strip() if isinstance(item, str) else ""
        if text and not text.startswith("$") and text not in out:
            out.append(text)
    return out


def collections_of(item: dict, raw: dict) -> list[str]:
    out: list[str] = []
    for listing in (
        item.get("website_inventory_collections"),
        raw.get("website_inventory_collections"),
        raw.get("inventory_collections"),
    ):
        if not isinstance(listing, list):
            continue
        for entry in listing:
            name = entry.strip() if isinstance(entry, str) else name_of(entry.get("name") if isinstance(entry, dict) else entry)
            if name and not name.startswith("$") and name not in out:
                out.append(name)
    return out


def colors_of(item: dict, raw: dict) -> list[str]:
    out: list[str] = []

    def add(name) -> None:
        text = str(name or "").strip()
        if text and not text.startswith("$") and text not in out:
            out.append(text)

    for color in item.get("exterior_colors") or []:
        add(color if isinstance(color, str) else (color or {}).get("name") if isinstance(color, dict) else "")
    for color in raw.get("exterior_color_name") or []:
        add(color)
    return out


def page_url_of(item: dict, raw: dict, page_url: str) -> str:
    candidates = [page_url, item.get("url")]
    if isinstance(raw.get("urls"), list):
        candidates.extend(raw["urls"])
    for candidate in candidates:
        if not isinstance(candidate, str) or is_api_url(candidate):
            continue
        if re.search(r"rvcountry\.com/inventory/[^/?#]+", candidate):
            return candidate.split("?")[0]
    return ""


def sale_price(raw: dict, item: dict):
    # MSRP is the listed price when the page has no sale price.
    for value in (
        raw.get("price_current", item.get("price_current")),
        raw.get("price_hidden", item.get("price_hidden")),
        raw.get("price_lowest", item.get("price_lowest")),
        raw.get("price_msrp", item.get("price_msrp")),
    ):
        number = positive(value)
        if number is not None:
            return number
    return None


def received_date(value):
    text = text_or_none(value if isinstance(value, str) else "")
    if not text:
        return None
    day = text[:10]
    return day if re.fullmatch(r"\d{4}-\d{2}-\d{2}", day) else None


def format_scraped_at(moment: datetime | None = None) -> str:
    when = moment or datetime.now(ZoneInfo("America/Phoenix"))
    if when.tzinfo is None:
        when = when.replace(tzinfo=ZoneInfo("America/Phoenix"))
    local = when.astimezone(ZoneInfo("America/Phoenix"))
    return local.strftime("%Y-%m-%dT%H:%M:%S-07:00")


def location_of(item: dict, raw: dict) -> dict:
    for candidate in (item.get("company_location"), raw.get("company_location")):
        if not isinstance(candidate, dict):
            continue
        if candidate.get("city") or candidate.get("state") or candidate.get("phone") or name_of(candidate.get("name")):
            return candidate
    return {}


def compact_raw(attributes: dict, flags: list, raw: dict, item: dict) -> dict:
    out: dict = {}
    if attributes:
        out["attributes"] = attributes
    if flags:
        out["flags"] = flags
    feature = string_list(raw.get("floorplan_feature"))
    lifestyle = string_list(raw.get("floorplan_lifestyle"))
    style = string_list(raw.get("floorplan_style"))
    if feature:
        out["floorplan_feature"] = feature
    if lifestyle:
        out["floorplan_lifestyle"] = lifestyle
    if style:
        out["floorplan_style"] = style
    colors = colors_of(item, raw)
    if colors:
        out["exterior_colors"] = colors
    custom = raw.get("custom_fields")
    if isinstance(custom, dict) and custom:
        out["custom_fields"] = custom
    unit_type = pick_name(
        (item.get("unit_classification") or {}).get("vehicle_type") if isinstance(item.get("unit_classification"), dict) else None,
        (raw.get("unit_classification") or {}).get("vehicle_type") if isinstance(raw.get("unit_classification"), dict) else None,
    )
    if unit_type:
        out["unit_type"] = unit_type
    collections = collections_of(item, raw)
    if collections:
        out["collections"] = collections
    return out


def map_unit(item: dict, scraped_at: str = "", page_url: str = "") -> dict:
    raw = raw_of(item)
    attributes, flags = spec_sheet(raw)
    propane_lbs, propane_gal = propane_of(raw)
    loc = location_of(item, raw)
    images = raw.get("images") if isinstance(raw.get("images"), list) else item.get("images") if isinstance(item.get("images"), list) else []
    axle = num(attr_value(raw, "Number of Axles"))
    row = {
        "source": "own",
        "dealer": "RV Country",
        "year": num(raw.get("year", item.get("year"))),
        "make": pick_name(item.get("unit_make"), raw.get("unit_make")),
        "model": pick_name(item.get("unit_model"), raw.get("unit_model")),
        "trim": pick_name(item.get("trim"), raw.get("unit_trim"), item.get("unit_trim")),
        "title": text_or_none(raw.get("title")) or text_or_none(item.get("title")) or "",
        "price": sale_price(raw, item),
        "price_msrp": positive(raw.get("price_msrp", item.get("price_msrp"))),
        "price_current": positive(raw.get("price_current", item.get("price_current"))),
        "price_hidden": positive(raw.get("price_hidden", item.get("price_hidden"))),
        "price_lowest": positive(raw.get("price_lowest", item.get("price_lowest"))),
        "vin": text_or_none(raw.get("vin")) or text_or_none(item.get("vin")) or "",
        "stock_number": text_or_none(str(raw.get("stock_number") if raw.get("stock_number") is not None else item.get("stock_number") or "")) or "",
        "condition": pick_name(item.get("condition"), raw.get("condition")),
        "body_type": pick_name(item.get("unit_classification"), raw.get("unit_classification")) or None,
        "mileage": count_or_null(raw.get("odometer", item.get("mileage"))) if raw.get("odometer", item.get("mileage")) is not None else 0,
        "location": name_of(loc.get("name")),
        "lot_status": text_or_none(raw.get("lot_status")) or text_or_none(item.get("lotStatus")) or "",
        "url": page_url_of(item, raw, page_url),
        "source_page": page_url_of(item, raw, page_url),
        "scraped_at": scraped_at or "",
        "id": num(raw.get("id", item.get("id"))),
        "hitch_weight": positive(raw.get("hitch_weight", item.get("hitch_weight"))),
        "gvwr": positive(raw.get("gvwr", item.get("gvwr"))),
        "dry_weight": positive(raw.get("dry_weight")),
        "payload": positive(raw.get("standard_payload", raw.get("payload"))),
        "cargo_carrying_capacity": positive(raw.get("cargo_carrying_capacity")) or positive(attr_value(raw, "Cargo Carrying Capacity")),
        "air_conditioning_btu": positive(raw.get("air_conditioning_btu")),
        "number_of_ac_units": positive(raw.get("number_of_ac_units")) or positive(attr_value(raw, "Number of AC Units")),
        "torque": positive(raw.get("torque")),
        "water_heater_tank_capacity": positive(raw.get("water_heater_tank_capacity")),
        "vehicle_body_length": positive(raw.get("vehicle_body_length", item.get("vehicle_body_length"))),
        "vehicle_body_height": positive(raw.get("vehicle_body_height", item.get("exterior_height"))),
        "vehicle_body_width": positive(raw.get("vehicle_body_width", item.get("exterior_width"))),
        "max_sleeping_count": count_or_null(raw.get("max_sleeping_count", item.get("max_sleeping_count"))),
        "number_of_slideouts": count_or_null(raw.get("number_of_slideouts", item.get("number_of_slideouts"))),
        "total_fresh_water_tank_capacity": positive(raw.get("total_fresh_water_tank_capacity")),
        "total_gray_water_tank_capacity": positive(raw.get("total_gray_water_tank_capacity")),
        "total_black_water_tank_capacity": positive(raw.get("total_black_water_tank_capacity")),
        "propane_lbs": propane_lbs,
        "propane_gal": propane_gal,
        "engine": text_or_none(raw.get("engine")),
        "chassis_brand": text_or_none(raw.get("chassis_brand")),
        "fuel_type": text_or_none(raw.get("fuel_type")) or text_or_none(item.get("fuel_type")),
        "transmission": text_or_none(attr_value(raw, "Transmission Type")),
        "fuel_tank_capacity": positive(raw.get("fuel_tank_capacity")),
        "awning_length": positive(raw.get("awning_length")),
        "generator": text_or_none(attr_value(raw, "Generator Type")),
        "heater_btu": positive(raw.get("heater_btu")),
        "towing_capacity": positive(raw.get("towing_capacity")),
        "horsepower": positive(raw.get("horsepower")),
        "number_of_axles": axle if isinstance(axle, (int, float)) and axle > 0 else None,
        "lot_code": text_or_none(raw.get("lot")),
        "received_date": received_date(raw.get("received_date")),
        "price_monthly": positive(raw.get("price_monthly", item.get("price_monthly"))),
        "price_biweekly": positive(raw.get("price_biweekly")),
        "price_current_incl_fees": positive(raw.get("price_current_incl_fees")),
        "document_fee": positive(raw.get("document_fee", item.get("document_fee"))),
        "dealer_prep_fee": positive(raw.get("dealer_prep_fee")),
        "on_special": bool(raw.get("on_special", item.get("on_special"))),
        "is_certified": bool(raw.get("is_certified", item.get("is_certified"))),
        "photo": text_or_none(raw.get("display_image")) or text_or_none(item.get("display_image")),
        "floorplan_image": text_or_none(raw.get("floorplan_image")) or text_or_none(item.get("floorplan_image")),
        "image_count": len(images),
        "location_city": text_or_none(loc.get("city")),
        "location_state": text_or_none(loc.get("state")),
        "location_phone": text_or_none(loc.get("phone")),
        "detail_fetched": True,
        "raw": compact_raw(attributes, flags, raw, item),
    }
    url = row["url"]
    row["source_page"] = url
    if row["mileage"] is None:
        row["mileage"] = 0
    return {key: value for key, value in row.items() if value is not None or key in KEEP_NULL}


def is_slim_row(row: dict) -> bool:
    raw = row.get("raw") if isinstance(row, dict) else None
    return not isinstance(raw, dict) or not isinstance(raw.get("attributes"), dict)


def row_stock(row: dict) -> str:
    return str(row.get("stock_number") or row.get("id") or "")


def row_url(row: dict) -> str:
    return str(row.get("url") or row.get("source_page") or "")


def filter_slim_rows(
    rows: list,
    *,
    max_missing_ratio: float = DEFAULT_MAX_MISSING_RATIO,
    min_units: int = DEFAULT_MIN_UNITS,
    log=None,
) -> tuple[list, str]:
    """Drop rows missing raw.attributes. Return (kept, reason).

    reason is empty when kept may be written. A missing share above
    max_missing_ratio refuses before anything is dropped into the file.
    The kept total has to reach min_units.
    """
    if not rows:
        return [], "refusing slim snapshot (no units)"
    dropped = [row for row in rows if is_slim_row(row)]
    missing = len(dropped)
    if missing / len(rows) > max_missing_ratio:
        return [], f"refusing slim snapshot ({missing} rows missing raw.attributes)"
    kept = [row for row in rows if not is_slim_row(row)]
    for row in dropped:
        line = f"[scrape-rvcountry] dropping stock {row_stock(row)} missing raw.attributes {row_url(row)}"
        if log is None:
            print(line, file=sys.stderr)
        else:
            log(line)
    if len(kept) < min_units:
        return [], f"refusing slim snapshot ({len(kept)} units is under {min_units})"
    return kept, ""


def slim_reason(
    rows: list,
    max_missing_ratio: float = DEFAULT_MAX_MISSING_RATIO,
    min_units: int = DEFAULT_MIN_UNITS,
) -> str:
    _kept, reason = filter_slim_rows(
        rows,
        max_missing_ratio=max_missing_ratio,
        min_units=min_units,
        log=lambda _line: None,
    )
    return reason


def default_checkpoint(out: str) -> str:
    return f"{out}.partial.jsonl"


def start_checkpoint(path: str, scraped_at: str) -> None:
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        handle.write(json.dumps({"checkpoint": 1, "scraped_at": scraped_at}) + "\n")


def append_checkpoint(path: str, url: str, rows: list) -> None:
    with open(path, "a", encoding="utf-8") as handle:
        handle.write(json.dumps({"url": url, "rows": rows}, ensure_ascii=False) + "\n")
        handle.flush()
        os.fsync(handle.fileno())


def load_checkpoint(path: str, max_age_s: float, now: datetime | None = None) -> tuple[str, dict]:
    """Return (scraped_at, {url: rows}) from a usable checkpoint, else ("", {}).

    A torn last line (killed mid-write) is ignored. A checkpoint whose
    scraped_at is older than max_age_s is not resumed.
    """
    if not path or not os.path.exists(path):
        return "", {}
    try:
        with open(path, encoding="utf-8") as handle:
            lines = handle.read().splitlines()
    except OSError:
        return "", {}
    if not lines:
        return "", {}
    try:
        header = json.loads(lines[0])
    except json.JSONDecodeError:
        return "", {}
    scraped_at = header.get("scraped_at") if isinstance(header, dict) else None
    if not isinstance(scraped_at, str) or not scraped_at:
        return "", {}
    try:
        started = datetime.fromisoformat(scraped_at)
    except ValueError:
        return "", {}
    current = now or datetime.now(ZoneInfo("America/Phoenix"))
    if current.tzinfo is None:
        current = current.replace(tzinfo=ZoneInfo("America/Phoenix"))
    age = (current - started).total_seconds()
    if age < 0 or age > max_age_s:
        return "", {}
    done: dict[str, list] = {}
    for line in lines[1:]:
        try:
            entry = json.loads(line)
        except json.JSONDecodeError:
            continue
        if not isinstance(entry, dict) or not isinstance(entry.get("url"), str):
            continue
        rows = entry.get("rows")
        if not isinstance(rows, list):
            continue
        if any(not isinstance(row, dict) or row.get("scraped_at") != scraped_at for row in rows):
            continue
        done[entry["url"]] = rows
    return scraped_at, done


def fetch_text(url: str, opener=urlopen, timeout: int = 40) -> tuple[int, str]:
    if is_api_url(url):
        raise ScrapeFailed(f"refusing /api/ url {url}")
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xml;q=0.9,*/*;q=0.8"})
    try:
        with opener(request, timeout=timeout) as response:
            status = getattr(response, "status", 200) or 200
            body = response.read().decode("utf-8", "replace")
    except HTTPError as err:
        status = err.code
        body = err.read().decode("utf-8", "replace")
    except URLError as err:
        raise ScrapeFailed(f"scrape failed ({err.reason}) {url}") from err
    if is_blocked_response(status, body):
        raise ScrapeBlocked(f"scrape blocked ({status}) {url}")
    return status, body


def scrape(
    max_units: int | None = None,
    opener=urlopen,
    sleep=time.sleep,
    pace: float = PACE_SECONDS,
    now: datetime | None = None,
    max_missing_ratio: float = DEFAULT_MAX_MISSING_RATIO,
    min_units: int = DEFAULT_MIN_UNITS,
    checkpoint: str | None = None,
    resume_max_age_s: float = DEFAULT_RESUME_MAX_AGE_HOURS * 3600,
    log=None,
):
    requested: list[str] = []
    last = 0.0

    def get(url: str) -> tuple[int, str]:
        nonlocal last
        if last:
            wait = pace - (time.time() - last)
            if wait > 0:
                sleep(wait)
        last = time.time()
        requested.append(url)
        return fetch_text(url, opener=opener)

    vehicle_status, vehicle = get(VEHICLE_SITEMAP)
    if vehicle_status >= 400:
        raise ScrapeFailed(f"scrape failed ({vehicle_status}) {VEHICLE_SITEMAP}")
    srp_status, srp = get(SRP_SITEMAP)
    if srp_status >= 400:
        raise ScrapeFailed(f"scrape failed ({srp_status}) {SRP_SITEMAP}")
    urls = inventory_urls_from_sitemap(vehicle)
    seen = set(urls)
    for url in inventory_urls_from_sitemap(srp):
        if url not in seen:
            seen.add(url)
            urls.append(url)
    if max_units is not None:
        urls = urls[:max_units]
    scraped_at = format_scraped_at(now)
    done: dict[str, list] = {}
    if checkpoint:
        resumed_at, done = load_checkpoint(checkpoint, resume_max_age_s, now=now)
        if resumed_at:
            scraped_at = resumed_at
            say = log or (lambda line: print(line, file=sys.stderr))
            reused = sum(1 for url in urls if url in done)
            say(f"[scrape-rvcountry] resuming {checkpoint}: {reused} of {len(urls)} pages already fetched, scraped_at {scraped_at}")
        else:
            start_checkpoint(checkpoint, scraped_at)
    rows = []
    for url in urls:
        if url in done:
            rows.extend(done[url])
            continue
        status, body = get(url)
        if status == 404:
            if checkpoint:
                append_checkpoint(checkpoint, url, [])
            continue
        if status >= 400:
            raise ScrapeFailed(f"scrape failed ({status}) {url}")
        units = extract_embedded_units(body)
        if not units:
            raise ScrapeFailed(f"scrape failed (no embedded unit) {url}")
        page_rows = [map_unit(unit, scraped_at=scraped_at, page_url=url) for unit in units]
        if checkpoint:
            append_checkpoint(checkpoint, url, page_rows)
        rows.extend(page_rows)
    deduped = []
    by_stock: dict[str, dict] = {}
    for row in rows:
        stock = row.get("stock_number") or str(row.get("id") or "")
        prev = by_stock.get(stock)
        if prev is None or len((row.get("raw") or {}).get("attributes") or {}) > len((prev.get("raw") or {}).get("attributes") or {}):
            by_stock[stock] = row
    deduped = list(by_stock.values())
    kept, reason = filter_slim_rows(
        deduped,
        max_missing_ratio=max_missing_ratio,
        min_units=min_units,
    )
    if reason:
        raise ScrapeFailed(reason)
    return {"rows": kept, "scraped_at": scraped_at, "requested": requested}


def write_snapshot(path: str, rows: list) -> None:
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    text = "[\n" + ",\n".join(json.dumps(row, ensure_ascii=False) for row in rows) + "\n]\n"
    tmp = f"{path}.tmp-{os.getpid()}"
    with open(tmp, "w", encoding="utf-8") as handle:
        handle.write(text)
    os.replace(tmp, path)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Scrape the RV Country own lot into the rich snapshot.")
    parser.add_argument("--max", type=int, default=None, help="Fetch only N inventory pages")
    parser.add_argument("--out", default=os.environ.get("OWN_LOT_INVENTORY_PATH") or DEFAULT_OUT)
    parser.add_argument(
        "--max-missing-ratio",
        type=float,
        default=DEFAULT_MAX_MISSING_RATIO,
        help="Refuse when more than this share of rows lack raw.attributes (default 0.02)",
    )
    parser.add_argument(
        "--min-units",
        type=int,
        default=DEFAULT_MIN_UNITS,
        help="Refuse when the kept snapshot is under this many units (default 1200)",
    )
    parser.add_argument("--checkpoint", default=None, help="Resume file (default <out>.partial.jsonl)")
    parser.add_argument("--no-resume", action="store_true", help="Ignore and overwrite any checkpoint")
    parser.add_argument(
        "--resume-max-age-hours",
        type=float,
        default=DEFAULT_RESUME_MAX_AGE_HOURS,
        help="Only resume a checkpoint started within this many hours (default 6)",
    )
    args = parser.parse_args(argv)
    if args.max is not None and args.max < 1:
        print("[scrape-rvcountry] --max needs a positive integer", file=sys.stderr)
        return 1
    checkpoint = None if args.max else (args.checkpoint or default_checkpoint(args.out))
    if checkpoint and args.no_resume and os.path.exists(checkpoint):
        os.remove(checkpoint)
    try:
        scraped = scrape(
            max_units=args.max,
            max_missing_ratio=args.max_missing_ratio,
            min_units=args.min_units,
            checkpoint=checkpoint,
            resume_max_age_s=args.resume_max_age_hours * 3600,
        )
    except (ScrapeBlocked, ScrapeFailed) as err:
        print(f"[scrape-rvcountry] {err}", file=sys.stderr)
        if checkpoint and os.path.exists(checkpoint):
            print(f"[scrape-rvcountry] checkpoint kept for resume: {checkpoint}", file=sys.stderr)
        return 1
    write_snapshot(args.out, scraped["rows"])
    if checkpoint and os.path.exists(checkpoint):
        os.remove(checkpoint)
    partial = f" (max {args.max})" if args.max else ""
    print(f"own-lot scrape: {len(scraped['rows'])} units, scraped {scraped['scraped_at']}{partial} -> {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
