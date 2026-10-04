#!/usr/bin/env python3
import json
import tempfile
import unittest
from pathlib import Path

from scrape_rvcountry_rich import (
    extract_embedded_units,
    filter_slim_rows,
    inventory_urls_from_sitemap,
    is_api_url,
    is_blocked_response,
    map_unit,
    load_checkpoint,
    scrape,
    slim_reason,
    write_snapshot,
)


def rich_item():
    return {
        "id": 1,
        "stock_number": "47492",
        "vin": "ABC",
        "year": 2027,
        "title": "2027 Thor Inception",
        "trim": "38DX",
        "description": "King Bed mentioned only in the listing text",
        "price_msrp": 378889,
        "price_current": 305995,
        "price_lowest": 305995,
        "unit_make": {"name": "Thor Motor Coach"},
        "unit_model": {"name": "Inception"},
        "unit_classification": {"name": "Class Super C", "vehicle_type": {"name": "Motorhome"}},
        "condition": {"name": "New"},
        "lotStatus": "Available",
        "display_image": "https://example.com/photo.jpg",
        "company_location": {"name": "Mesa AZ", "city": "Mesa", "state": "AZ", "phone": "480"},
        "website_inventory_collections": ["Clearance"],
        "_raw": {
            "stock_number": "47492",
            "vin": "ABC",
            "year": 2027,
            "title": "2027 Thor Inception",
            "odometer": 0,
            "price_msrp": 378889,
            "price_current": 305995,
            "price_lowest": 305995,
            "lot": "PEZ",
            "lot_status": "Available",
            "unit_trim": {"name": "38DX"},
            "display_image": "https://example.com/photo.jpg",
            "images": [{"url": "https://example.com/photo.jpg"}],
            "floorplan_feature": ["King Bed"],
            "inventory_unit_attributes": [
                {"name": "Number of King Size Beds", "value": "1", "brand_value": "1"},
                {"name": "Bluetooth® Audio", "value": "Bluetooth® Audio", "brand_value": "Bluetooth® Audio"},
            ],
            "feature_list": ["Listing feature that is not a spec flag"],
            "website_inventory_collections": ["Clearance"],
        },
    }


class RichScrapeTest(unittest.TestCase):
    def test_sitemap_drops_api(self):
        xml = """
        <url><loc>https://rvcountry.com/inventory/2027-thor-47492</loc></url>
        <url><loc>https://rvcountry.com/api/inventory/secret</loc></url>
        <url><loc>https://rvcountry.com/class-a</loc></url>
        """
        self.assertEqual(
            inventory_urls_from_sitemap(xml),
            ["https://rvcountry.com/inventory/2027-thor-47492"],
        )
        self.assertTrue(is_api_url("https://rvcountry.com/api/inventory"))

    def test_block_statuses(self):
        self.assertTrue(is_blocked_response(403, "nope"))
        self.assertTrue(is_blocked_response(429, ""))
        self.assertTrue(is_blocked_response(503, ""))
        self.assertTrue(is_blocked_response(200, "<title>Just a moment...</title>"))
        self.assertFalse(is_blocked_response(200, '"initialItem":{"stock_number":"1"}'))

    def test_spec_sheet_and_slim_guard(self):
        row = map_unit(rich_item(), scraped_at="2026-10-03T01:00:00-07:00", page_url="https://rvcountry.com/inventory/2027-thor-47492")
        self.assertEqual(row["raw"]["attributes"]["Number of King Size Beds"], "1")
        self.assertEqual(row["raw"]["flags"], ["Bluetooth® Audio"])
        self.assertNotIn("Clearance", row["raw"]["attributes"])
        self.assertNotIn("Clearance", row["raw"]["flags"])
        blob = json.dumps(row)
        self.assertNotIn("listing text", blob)
        self.assertNotIn("Listing feature that is not a spec flag", blob)
        self.assertEqual(slim_reason([row], min_units=1), "")
        self.assertIn("missing raw.attributes", slim_reason([{"stock_number": "1", "year": 2027}]))

    def test_msrp_when_no_sale_price(self):
        item = rich_item()
        item["price_current"] = None
        item["price_lowest"] = None
        item["_raw"]["price_current"] = None
        item["_raw"]["price_hidden"] = None
        item["_raw"]["price_lowest"] = None
        item["_raw"]["price_msrp"] = 189955
        item["price_msrp"] = 189955
        row = map_unit(item, scraped_at="2026-10-03T01:00:00-07:00", page_url="https://rvcountry.com/inventory/x")
        self.assertEqual(row["price"], 189955)
        self.assertIsNone(row["price_current"])

    def test_split_flight_payload(self):
        item = rich_item()
        payload = '{"initialItem":' + json.dumps(item) + "}"
        mid = len(payload) // 2
        html = "".join(
            f'<script>self.__next_f.push({json.dumps([1, part])})</script>'
            for part in (payload[:mid], payload[mid:])
        )
        units = extract_embedded_units(html)
        self.assertEqual(units[0]["stock_number"], "47492")


def lot_row(stock: str, *, slim: bool = False) -> dict:
    row = {
        "stock_number": stock,
        "url": f"https://rvcountry.com/inventory/{stock}",
        "raw": {"attributes": {"GVWR": "16000"}},
    }
    if slim:
        row["raw"] = {}
    return row


class SlimSnapshotTest(unittest.TestCase):
    def test_two_bad_rows_out_of_1400_are_dropped_and_logged(self):
        rows = [lot_row(str(i)) for i in range(1398)]
        rows.append(lot_row("BAD1", slim=True))
        rows.append(lot_row("BAD2", slim=True))
        logged: list[str] = []
        kept, reason = filter_slim_rows(rows, log=logged.append)
        self.assertEqual(reason, "")
        self.assertEqual(len(kept), 1398)
        self.assertEqual(logged, [
            "[scrape-rvcountry] dropping stock BAD1 missing raw.attributes https://rvcountry.com/inventory/BAD1",
            "[scrape-rvcountry] dropping stock BAD2 missing raw.attributes https://rvcountry.com/inventory/BAD2",
        ])
        with tempfile.TemporaryDirectory() as tmp:
            path = str(Path(tmp) / "own-lot.json")
            write_snapshot(path, kept)
            written = json.loads(Path(path).read_text())
        self.assertEqual(len(written), 1398)
        self.assertTrue(all(row["stock_number"] not in {"BAD1", "BAD2"} for row in written))

    def test_five_percent_missing_attributes_refuses(self):
        rows = [lot_row(str(i)) for i in range(950)]
        rows.extend(lot_row(f"bad-{i}", slim=True) for i in range(50))
        logged: list[str] = []
        kept, reason = filter_slim_rows(rows, log=logged.append)
        self.assertEqual(kept, [])
        self.assertIn("missing raw.attributes", reason)
        self.assertIn("50", reason)
        self.assertEqual(logged, [])

    def test_under_1200_units_refuses(self):
        rows = [lot_row(str(i)) for i in range(1199)]
        kept, reason = filter_slim_rows(rows, log=lambda _line: None)
        self.assertEqual(kept, [])
        self.assertIn("under 1200", reason)


class FakeResponse:
    def __init__(self, body: str, status: int = 200):
        self.body = body.encode("utf-8")
        self.status = status

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False

    def read(self):
        return self.body


def unit_page(stock: str) -> str:
    item = rich_item()
    item = json.loads(json.dumps(item))
    item["stock_number"] = stock
    item["_raw"]["stock_number"] = stock
    return '<script>window.x={"initialItem":' + json.dumps(item) + "}</script>"


class Killed(Exception):
    pass


def fake_site(stocks, fetched, kill_after=None):
    sitemap = "".join(f"<loc>https://rvcountry.com/inventory/u-{s}</loc>" for s in stocks)

    def opener(request, timeout=40):
        url = request.full_url
        if url.endswith("vehicle-sitemap.xml"):
            return FakeResponse(f"<urlset>{sitemap}</urlset>")
        if url.endswith("srp-sitemap.xml"):
            return FakeResponse("<urlset></urlset>")
        if kill_after is not None and len(fetched) >= kill_after:
            raise Killed(url)
        fetched.append(url)
        return FakeResponse(unit_page(url.rsplit("-", 1)[1]))

    return opener


class ResumeTest(unittest.TestCase):
    def run_scrape(self, opener, checkpoint, now, max_age_s=6 * 3600):
        return scrape(
            opener=opener,
            sleep=lambda _s: None,
            pace=0,
            now=now,
            min_units=1,
            checkpoint=checkpoint,
            resume_max_age_s=max_age_s,
            log=lambda _line: None,
        )

    def test_killed_run_resumes_without_refetching(self):
        from datetime import datetime, timedelta
        from zoneinfo import ZoneInfo

        start = datetime(2026, 10, 4, 5, 43, 15, tzinfo=ZoneInfo("America/Phoenix"))
        with tempfile.TemporaryDirectory() as tmp:
            checkpoint = str(Path(tmp) / "own.partial.jsonl")
            first: list = []
            with self.assertRaises(Killed):
                self.run_scrape(fake_site(["1", "2", "3", "4"], first, kill_after=2), checkpoint, start)
            self.assertEqual(len(first), 2)
            second: list = []
            later = start + timedelta(minutes=40)
            # Unit 2 sold between runs, unit 5 arrived.
            result = self.run_scrape(fake_site(["1", "3", "4", "5"], second), checkpoint, later)
            self.assertEqual([u.rsplit("-", 1)[1] for u in second], ["3", "4", "5"])
            self.assertEqual(sorted(r["stock_number"] for r in result["rows"]), ["1", "3", "4", "5"])
            self.assertEqual(result["scraped_at"], "2026-10-04T05:43:15-07:00")
            self.assertEqual({r["scraped_at"] for r in result["rows"]}, {"2026-10-04T05:43:15-07:00"})

    def test_old_checkpoint_starts_over(self):
        from datetime import datetime, timedelta
        from zoneinfo import ZoneInfo

        start = datetime(2026, 10, 3, 5, 43, 15, tzinfo=ZoneInfo("America/Phoenix"))
        with tempfile.TemporaryDirectory() as tmp:
            checkpoint = str(Path(tmp) / "own.partial.jsonl")
            with self.assertRaises(Killed):
                self.run_scrape(fake_site(["1", "2"], [], kill_after=1), checkpoint, start)
            later = start + timedelta(hours=24)
            self.assertEqual(load_checkpoint(checkpoint, 6 * 3600, now=later), ("", {}))
            fetched: list = []
            result = self.run_scrape(fake_site(["1", "2"], fetched), checkpoint, later)
            self.assertEqual(len(fetched), 2)
            self.assertEqual(result["scraped_at"], "2026-10-04T05:43:15-07:00")

    def test_torn_last_line_is_ignored(self):
        from datetime import datetime
        from zoneinfo import ZoneInfo

        now = datetime(2026, 10, 4, 6, 0, 0, tzinfo=ZoneInfo("America/Phoenix"))
        with tempfile.TemporaryDirectory() as tmp:
            checkpoint = Path(tmp) / "own.partial.jsonl"
            checkpoint.write_text(
                json.dumps({"checkpoint": 1, "scraped_at": "2026-10-04T05:43:15-07:00"})
                + "\n"
                + json.dumps({"url": "https://rvcountry.com/inventory/u-1", "rows": [{"stock_number": "1", "scraped_at": "2026-10-04T05:43:15-07:00"}]})
                + "\n{\"url\": \"https://rvcountry.com/inv"
            )
            scraped_at, done = load_checkpoint(str(checkpoint), 6 * 3600, now=now)
            self.assertEqual(scraped_at, "2026-10-04T05:43:15-07:00")
            self.assertEqual(list(done), ["https://rvcountry.com/inventory/u-1"])


if __name__ == "__main__":
    unittest.main()
