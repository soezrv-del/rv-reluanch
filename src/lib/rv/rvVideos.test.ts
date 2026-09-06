import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildRvVideoCoreQuery,
  buildRvVideoQuery,
  calmVideoLookupError,
  clearRvVideoSession,
  EMPTY_MATCH_MESSAGE,
  fetchRvVideos,
  formatShareVideoBlock,
  isRvVideoLibraryYear,
  LOOKUP_FAILED_MESSAGE,
  MISSING_KEY_MESSAGE,
  parseCoachModelYear,
  rankRvVideos,
  RELATED_NOTE,
  peekRvVideoSession,
  RV_VIDEO_LIBRARY_CHANNEL_ID,
  RV_VIDEO_LIBRARY_HANDLE,
  RV_VIDEO_LIBRARY_MIN_YEAR,
  shareVideoForCoach,
  shouldShowRvVideoPrompt,
  scoreTitleOverlap,
  tokenizeCoachQuery,
  youtubeWatchUrl,
} from "./rvVideos.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("channel coverage is 2016+; unknown year stays eligible", () => {
  assert.equal(RV_VIDEO_LIBRARY_MIN_YEAR, 2016);
  assert.equal(parseCoachModelYear("2015"), 2015);
  assert.equal(parseCoachModelYear("2016"), 2016);
  assert.equal(parseCoachModelYear("late"), null);
  assert.equal(parseCoachModelYear(""), null);
  assert.equal(isRvVideoLibraryYear("2015"), false);
  assert.equal(isRvVideoLibraryYear("2014"), false);
  assert.equal(isRvVideoLibraryYear("2016"), true);
  assert.equal(isRvVideoLibraryYear("2023"), true);
  assert.equal(isRvVideoLibraryYear(""), true);
  assert.equal(isRvVideoLibraryYear("n/a"), true);
  assert.equal(isRvVideoLibraryYear("2015-2016"), true);
});

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
  assert.equal(
    shouldShowRvVideoPrompt({
      year: "2016",
      make: "Tiffin",
      model: "Allegro Bus",
      type: "Class A Diesel",
    }),
    true,
  );
  assert.equal(
    shouldShowRvVideoPrompt({
      year: "2015",
      make: "Tiffin",
      model: "Allegro Bus",
      type: "Class A Diesel",
    }),
    false,
  );
  assert.equal(
    shouldShowRvVideoPrompt({
      year: "2010",
      make: "Newmar",
      model: "Dutch Star",
      type: "Class A Diesel",
    }),
    false,
  );
  assert.equal(
    shouldShowRvVideoPrompt({
      year: "n/a",
      make: "Tiffin",
      model: "Allegro Bus",
      type: "Class A Diesel",
    }),
    true,
  );
});

test("pre-2016 client lookup stays empty and never hits the proxy", async () => {
  clearRvVideoSession();
  const res = await fetchRvVideos({
    year: "2014",
    make: "Tiffin",
    model: "Allegro Bus",
    floorplan: "45OPP",
  });
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.videos.length, 0);
    assert.match(res.query, /2014 Tiffin Allegro Bus/);
  }
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
  assert.equal(
    calmVideoLookupError("API key not valid. Please pass a valid API key.").error,
    MISSING_KEY_MESSAGE,
  );
  assert.equal(
    calmVideoLookupError("API key not valid. Please pass a valid API key.").code,
    "missing_key",
  );
  assert.deepEqual(calmVideoLookupError("quotaExceeded"), {
    error: LOOKUP_FAILED_MESSAGE,
    code: "upstream",
  });
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
  const promptBlock = card.match(
    /data-rv-video-prompt[\s\S]*?<\/section>/,
  );
  assert.ok(promptBlock, "opt-in prompt block present");
  assert.doesNotMatch(promptBlock![0], /MISSING_KEY_MESSAGE/);
  assert.doesNotMatch(promptBlock![0], /Video lookup not configured/);
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
  assert.match(api, /process\.env\.YOUTUBE_API_KEY/);
  assert.match(api, /search\.list|youtube\/v3\/search/);
  assert.match(api, /channelId/);
  assert.match(api, /RV_VIDEO_LIBRARY_CHANNEL_ID/);
  assert.doesNotMatch(api, /forHandle|resolveChannelId|youtube\/v3\/channels/);
  assert.equal(RV_VIDEO_LIBRARY_CHANNEL_ID, "UCaAH7nANvUhdPWN93uQ6mcA");
  assert.equal(RV_VIDEO_LIBRARY_HANDLE, "RVVideoLibrary");
  assert.match(api, /MISSING_KEY_MESSAGE/);
  assert.doesNotMatch(api, /VITE_YOUTUBE/);

  assert.match(client, /\/api\/rv-videos/);
  assert.doesNotMatch(client, /YOUTUBE_API_KEY/);
  assert.doesNotMatch(client, /googleapis\.com\/youtube/);
  assert.match(client, /RV_VIDEO_LIBRARY_MIN_YEAR/);
  assert.match(client, /isRvVideoLibraryYear/);
  assert.match(api, /isRvVideoLibraryYear/);
  assert.doesNotMatch(api, /publishedAfter|publishedBefore|order=date/);
  assert.match(card, /isRvVideoLibraryYear/);
  assert.doesNotMatch(card, /Want a video date|publish date|video date/i);

  const kit = src("../../components/rvshare/RvShareKit.tsx");
  const share = src("shareKit.ts");
  assert.match(kit, /IntersectionObserver/);
  assert.match(kit, /fetchRvVideos/);
  assert.match(kit, /shouldShowRvVideoPrompt/);
  assert.match(kit, /data-share-video-toggle/);
  assert.match(kit, /INCLUDE VIDEO/);
  assert.match(kit, /includeVideo \? shareVideo : null/);
  assert.doesNotMatch(kit, /MISSING_KEY_MESSAGE/);
  assert.doesNotMatch(kit, /not configured/);
  assert.doesNotMatch(kit, /video\/mp4|video\/webm|new File\([^\)]*video/i);
  assert.match(share, /formatShareVideoBlock\(opts\.video\)/);
  assert.doesNotMatch(share, /include\.video/);
});

test("Share kit video block is a YouTube title + watch URL — never a file", () => {
  assert.deepEqual(
    formatShareVideoBlock({
      title: "2023 Tiffin Allegro Bus 45OPP walkthrough",
      youtubeUrl: "https://www.youtube.com/watch?v=abc123",
    }),
    [
      "VIDEO",
      "2023 Tiffin Allegro Bus 45OPP walkthrough",
      "https://www.youtube.com/watch?v=abc123",
    ],
  );
  assert.deepEqual(formatShareVideoBlock(null), []);
  assert.deepEqual(
    formatShareVideoBlock({
      title: "Walkthrough",
      youtubeUrl: "/tmp/walkthrough.mp4",
    }),
    [],
  );
  assert.deepEqual(
    formatShareVideoBlock({
      title: "",
      youtubeUrl: "https://www.youtube.com/watch?v=abc123",
    }),
    [],
  );
});

test("session cache surfaces one watch-link hit and stays silent without a match", async () => {
  clearRvVideoSession();
  const prior = globalThis.fetch;
  const modern = {
    year: "2023",
    make: "Tiffin",
    model: "Allegro Bus",
    floorplan: "45OPP",
    type: "Class A Diesel",
  };
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        ok: true,
        source: "RV Video Library",
        channel: "https://www.youtube.com/@RVVideoLibrary",
        query: "2023 Tiffin Allegro Bus 45OPP",
        videos: [
          {
            videoId: "abc123",
            title: "2023 Tiffin Allegro Bus 45OPP walkthrough",
            thumbnailUrl: "",
            youtubeUrl: "https://www.youtube.com/watch?v=abc123",
          },
        ],
        cached: false,
        note: RELATED_NOTE,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )) as typeof fetch;
  try {
    const res = await fetchRvVideos(modern);
    assert.equal(res.ok, true);
    const hit = shareVideoForCoach(modern);
    assert.ok(hit);
    assert.equal(hit!.title, "2023 Tiffin Allegro Bus 45OPP walkthrough");
    assert.equal(hit!.youtubeUrl, "https://www.youtube.com/watch?v=abc123");
    const again = await fetchRvVideos(modern);
    assert.equal(again, res);
  } finally {
    globalThis.fetch = prior;
    clearRvVideoSession();
  }
});

test("session cache hides Share toggle when key is missing or there is no match", async () => {
  clearRvVideoSession();
  const coach = {
    year: "2014",
    make: "Tiffin",
    model: "Allegro Bus",
    type: "Class A Diesel",
  };
  assert.equal(shouldShowRvVideoPrompt(coach), false);
  const res = await fetchRvVideos(coach);
  assert.equal(res.ok, true);
  if (res.ok) assert.equal(res.videos.length, 0);
  assert.equal(shareVideoForCoach(coach), null);
  assert.ok(peekRvVideoSession(coach));

  clearRvVideoSession();
  const prior = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        ok: false,
        error: MISSING_KEY_MESSAGE,
        code: "missing_key",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )) as typeof fetch;
  try {
    const modern = {
      year: "2023",
      make: "Tiffin",
      model: "Allegro Bus",
      floorplan: "45OPP",
      type: "Class A Diesel",
    };
    const missing = await fetchRvVideos(modern);
    assert.equal(missing.ok, false);
    if (!missing.ok) assert.equal(missing.code, "missing_key");
    assert.equal(shareVideoForCoach(modern), null);
  } finally {
    globalThis.fetch = prior;
    clearRvVideoSession();
  }
});
