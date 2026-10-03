#!/usr/bin/env python3
import json
import unittest

from scrape_rvcountry_rich import (
    extract_embedded_units,
    inventory_urls_from_sitemap,
    is_api_url,
    is_blocked_response,
    map_unit,
    slim_reason,
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
        self.assertEqual(slim_reason([row]), "")
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


if __name__ == "__main__":
    unittest.main()
