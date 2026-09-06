import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildRvVideoCoreQuery,
  buildRvVideoQuery,
  EMPTY_MATCH_MESSAGE,
  MISSING_KEY_MESSAGE,
  rankRvVideos,
  RELATED_NOTE,
  RV_VIDEO_LIBRARY_CHANNEL_ID,
  RV_VIDEO_LIBRARY_HANDLE,
  shouldShowRvVideoPrompt,
  scoreTitleOverlap,
  tokenizeCoachQuery,
  youtubeWatchUrl,
} from "./rvVideos.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("prompt hides empty / non-RV selection and shows motorhomes", () => {
  assert.equal(shouldShowRvVideoPrompt({}), false);
  assert.equal(
    shouldShowRvVideoPrompt({ year: "2023", make: "Tiffin", model: "" }),
    false,
  );
  assert.equal(
    shouldShowRvVideoPrompt({
      year: "2023",
      make: "Ford",
      model: "F-350",
      type: "Pickup truck",
    }),
    false,
  );
  assert.equal(
    shouldShowRvVideoPrompt({
      year: "2023",
      make: "American Coach",
      model: "American Dream",
      floorplan: "45A",
      type: "Class A Diesel",
    }),
    true,
  );
  assert.equal(
    shouldShowRvVideoPrompt({
      year: "2022",
      make: "Winnebago",
      model: "View",
      type: "Class C",
    }),
    true,
  );
  assert.equal(
    shouldShowRvVideoPrompt({
      year: "2021",
      make: "Keystone",
      model: "Montana",
      type: "Fifth Wheel",
    }),
    true,
  );
});

test("query is year + make + model and optional series/floorplan, no invent", () => {
  assert.equal(
    buildRvVideoQuery({
      year: "2023",
      make: "American Coach",
      model: "American Dream",
      floorplan: "45A",
    }),
    "2023 American Coach American Dream 45A",
  );
  assert.equal(
    buildRvVideoCoreQuery({
      year: "2023",
      make: "American Coach",
      model: "American Dream",
      floorplan: "45A",
    }),
    "2023 American Coach American Dream",
  );
  assert.equal(
    buildRvVideoQuery({
      year: "2022",
      make: "Tiffin",
      model: "Allegro Bus",
      series: "Allegro Bus",
    }),
    "2022 Tiffin Allegro Bus",
  );
});

test("title overlap ranks real matches and drops unrelated titles", () => {
  const q = "2023 Tiffin Allegro Bus 45OPP";
  const ranked = rankRvVideos(
    [
      { title: "Welcome to RV Video Library" },
      { title: "2023 Tiffin Allegro Bus 45OPP walkthrough" },
      { title: "Tiffin Allegro Bus tour" },
      { title: "2021 Newmar Dutch Star" },
    ],
    q,
  );
  assert.equal(ranked[0]!.title, "2023 Tiffin Allegro Bus 45OPP walkthrough");
  assert.equal(ranked[1]!.title, "Tiffin Allegro Bus tour");
  assert.equal(
    ranked.some((v) => v.title === "Welcome to RV Video Library"),
    false,
  );
  assert.equal(
    ranked.some((v) => v.title === "2021 Newmar Dutch Star"),
    false,
  );
  assert.ok(scoreTitleOverlap("2023 Tiffin Allegro Bus", tokenizeCoachQuery(q)) > 0);
});

test("watch URL is YouTube, not an invented Facts spec", () => {
  assert.equal(
    youtubeWatchUrl("abc123"),
    "https://www.youtube.com/watch?v=abc123",
  );
  assert.match(RELATED_NOTE, /not a confirmed match/i);
  assert.match(EMPTY_MATCH_MESSAGE, /No RV Video Library videos matched/i);
  assert.equal(MISSING_KEY_MESSAGE, "Video lookup not configured.");
});

test("Facts report only fetches videos after opt-in; key stays server-side", () => {
  const detail = src("../../components/rvfax/RvDetail.tsx");
  const card = src("../../components/rvfax/RvVideoLibraryCard.tsx");
  const api = src("../../routes/api/rv-videos.ts");
  const client = src("rvVideos.ts");

  assert.match(detail, /RvVideoLibraryCard/);
  assert.match(detail, /shouldShowRvVideoPrompt/);
  assert.doesNotMatch(detail, /fetchRvVideos/);
  assert.doesNotMatch(detail, /\/api\/rv-videos/);

  assert.match(card, /Want a video\?/);
  assert.match(card, /Would you like a video from RV Video Library\?/);
  assert.match(card, /fetchRvVideos/);
  assert.match(card, /onClick=\{\(\) => void onYes\(\)\}/);
  const resetEffect = card.match(
    /useEffect\(\(\) => \{[\s\S]*?\}, \[identity\]\);/,
  );
  assert.ok(resetEffect, "coach-change reset effect present");
  assert.doesNotMatch(resetEffect![0], /fetchRvVideos/);
  assert.match(card, /MISSING_KEY_MESSAGE/);
  assert.match(card, /RELATED_NOTE/);

  assert.match(api, /YOUTUBE_API_KEY/);
  assert.match(api, /search\.list|youtube\/v3\/search/);
  assert.match(api, /channelId/);
  assert.match(api, /RV_VIDEO_LIBRARY_CHANNEL_ID/);
  assert.match(api, /RV_VIDEO_LIBRARY_HANDLE/);
  assert.equal(RV_VIDEO_LIBRARY_CHANNEL_ID, "UCaAH7nANvUhdPWN93uQ6mcA");
  assert.equal(RV_VIDEO_LIBRARY_HANDLE, "RVVideoLibrary");
  assert.match(api, /MISSING_KEY_MESSAGE/);
  assert.doesNotMatch(api, /VITE_YOUTUBE/);

  assert.match(client, /\/api\/rv-videos/);
  assert.doesNotMatch(client, /YOUTUBE_API_KEY/);
  assert.doesNotMatch(client, /googleapis\.com\/youtube/);
});
