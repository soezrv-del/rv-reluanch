/**
 * QA stills for the Share kit HP/torque + files[] order PR.
 * Writes PNGs under /workspace/screenshots/ — not part of the app runtime.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  honestHorsepowerForCoach,
  honestTorqueForCoach,
} from "../src/lib/rv/catalogHonesty.ts";
import { sharePowerLines } from "../src/lib/rv/shareCardPolicy.ts";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "../screenshots");
mkdirSync(outDir, { recursive: true });

const geoHp = honestHorsepowerForCoach({
  engine: "Ford 7.3L / V10 (by year)",
  horsepower: 350,
  chassis: "Ford F53",
  type: "Class A Gas",
});
const geoTq = honestTorqueForCoach({
  engine: "Ford 7.3L / V10 (by year)",
  chassis: "Ford F53",
  type: "Class A Gas",
  torqueLbFt: null,
  horsepower: 350,
});
const geoPower = sharePowerLines(geoHp, geoTq);

const fr3Hp = honestHorsepowerForCoach({
  engine: "Ford 7.3L V8 Godzilla",
  horsepower: 335,
  chassis: "Ford F53",
  type: "Class A Gas",
});
const fr3Tq = honestTorqueForCoach({
  engine: "Ford 7.3L V8 Godzilla",
  chassis: "Ford F53",
  type: "Class A Gas",
  torqueLbFt: 468,
  horsepower: 335,
});
const fr3Power = sharePowerLines(fr3Hp, fr3Tq);

const georgetownKit = [
  "RvFOX · Powered by Grok",
  "Know before you buy.",
  "",
  "2022 Forest River Georgetown 328DS",
  "",
  "SUMMARY",
  "Forest River Georgetown — core gas Class A line (also see 5 Series / XL).",
  "",
  "RATING",
  "★ 2.6",
  "",
  ...geoPower,
  "",
  "MARKET",
  "MSRP $139,000",
  "",
  "PAYMENT (estimate)",
  "Price $169,000",
  "Rate 7.49%",
  "≈ $952 / mo",
  "Not a lender quote — confirm in RvCAL with ZIP tax.",
].join("\n");

const fr3Kit = [
  "RvFOX · Powered by Grok",
  "Know before you buy.",
  "",
  "2022 Forest River FR3 30DS",
  "",
  "SUMMARY",
  "Forest River FR3 — gas Class A on Ford F53.",
  "",
  ...fr3Power,
].join("\n");

writeFileSync(join(outDir, "share-kit-georgetown-328ds.txt"), georgetownKit);
writeFileSync(join(outDir, "share-kit-fr3-hp-torque.txt"), fr3Kit);
writeFileSync(
  join(outDir, "share-files-order.json"),
  JSON.stringify(
    {
      preference: "RV hero first — iMessage preview uses files[0]",
      default: [
        { index: 0, role: "hero", name: "2022_Forest_River_Georgetown_328DS-hero.jpg", type: "image/jpeg" },
        { index: 1, role: "card", name: "2022_Forest_River_Georgetown_328DS-card.png", type: "image/png", aspect: "16:9" },
      ],
      lifestyleOn: [
        { index: 0, role: "hero", name: "…-hero.jpg", type: "image/jpeg" },
        { index: 1, role: "lifestyle", name: "…-lifestyle.jpg", type: "image/jpeg", note: "deduped if same bytes as hero" },
        { index: 2, role: "card", name: "…-card.png", type: "image/png" },
      ],
    },
    null,
    2,
  ),
);

const heroPath = join(here, "../public/assets/lifestyle/class-a-gas.jpg");
const heroData = `data:image/jpeg;base64,${readFileSync(heroPath).toString("base64")}`;

const css = `
  html, body { margin: 0; background: #071018; color: #e8eef6; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
  .page { width: 1280px; min-height: 100vh; padding: 28px 32px 36px; box-sizing: border-box; }
  h1 { margin: 0 0 6px; font-size: 22px; letter-spacing: -0.02em; }
  .sub { margin: 0 0 22px; color: #8aa0b8; font-size: 13px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .card { background: #102033; border: 1px solid #24405c; border-radius: 16px; padding: 16px 18px; }
  .label { font-size: 10px; font-weight: 800; letter-spacing: 0.16em; color: #7dd3fc; margin-bottom: 10px; }
  pre { margin: 0; white-space: pre-wrap; font: 600 13px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace; color: #f4f8fc; }
  .power { color: #7dd3fc; font-weight: 800; }
  .files { display: flex; flex-direction: column; gap: 12px; }
  .file { display: grid; grid-template-columns: 56px 1fr 220px; gap: 12px; align-items: center; background: #0b1b33; border-radius: 12px; padding: 10px; }
  .idx { width: 44px; height: 44px; border-radius: 999px; background: #1d6fbf; display: grid; place-items: center; font-weight: 900; }
  .name { font-weight: 800; font-size: 14px; }
  .meta { color: #8aa0b8; font-size: 12px; margin-top: 2px; }
  .thumb { width: 220px; height: 124px; object-fit: cover; border-radius: 8px; background: #f4f8fc; }
  canvas.thumb { display: block; }
  .note { margin-top: 16px; color: #9fb4c8; font-size: 12px; }
`;

const paintPower = (text) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/POWER\n[\s\S]*?(?=\n\n|$)/g, (m) => `<span class="power">${m}</span>`);

const kitHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>
<body><div class="page">
  <h1>Share kit text — catalog POWER</h1>
  <p class="sub">Same Facts SoT as #130. Georgetown 328DS has 350 HP and no catalog torque (not invented). FR3 shows HP + torque.</p>
  <div class="grid">
    <div class="card">
      <div class="label">2022 FOREST RIVER GEORGETOWN 328DS</div>
      <pre>${paintPower(georgetownKit)}</pre>
    </div>
    <div class="card">
      <div class="label">2022 FOREST RIVER FR3 30DS — HP + TORQUE</div>
      <pre>${paintPower(fr3Kit)}</pre>
    </div>
  </div>
</div></body></html>`;

const cardScript = `
  const ctx = document.getElementById("card").getContext("2d");
  const W = 1200, H = 675;
  const NAVY = "#0b1b33", PAPER = "#f4f8fc", INK = "#0b1220", BLUE = "#1d6fbf", BLUE_DEEP = "#0e4f8f", RED = "#c81e1e";
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = NAVY; ctx.fillRect(0, 0, W, 12);
  const pad = 72, box = 96, footH = 72, contentH = 150;
  const boxY = Math.round(12 + Math.max(36, (H - 12 - footH - contentH) / 2));
  ctx.beginPath();
  ctx.roundRect(pad, boxY, box, box, 16);
  ctx.fillStyle = NAVY; ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "800 30px system-ui, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("DH", pad + box / 2, boxY + box / 2 + 1);
  const textX = pad + box + 28;
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = BLUE; ctx.font = "800 15px system-ui, sans-serif";
  ctx.fillText("PREPARED BY", textX, boxY + 22);
  ctx.fillStyle = INK; ctx.font = "900 44px system-ui, sans-serif";
  ctx.fillText("David Hansen", textX, boxY + 70);
  ctx.fillStyle = BLUE_DEEP; ctx.font = "800 28px system-ui, sans-serif";
  ctx.fillText("702-266-5918", textX, boxY + 112);
  ctx.fillStyle = BLUE; ctx.fillRect(textX, boxY + 118, 220, 3);
  ctx.textAlign = "right";
  ctx.font = "900 40px system-ui, sans-serif";
  ctx.fillStyle = INK; ctx.fillText("Rv", W - pad - 170, boxY + 48);
  ctx.fillStyle = BLUE; ctx.fillText("FOX", W - pad - 78, boxY + 48);
  ctx.fillStyle = INK; ctx.fillText(" Pro", W - pad, boxY + 48);
  ctx.fillStyle = RED; ctx.font = "800 16px system-ui, sans-serif";
  ctx.fillText("KNOW BEFORE YOU BUY", W - pad, boxY + 82);
  ctx.fillStyle = NAVY; ctx.fillRect(0, H - footH, W, footH);
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = "800 18px system-ui, sans-serif";
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText("Confirm door sticker · PPI · lender", pad, H - footH / 2);
  ctx.fillStyle = "#7dd3fc"; ctx.textAlign = "right";
  ctx.fillText("RvFOX · Powered by Grok", W - pad, H - footH / 2);
`;

const filesHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>
<body><div class="page">
  <h1>Share files[] order — Messages preview</h1>
  <p class="sub">iMessage uses files[0] as the bubble image. Locked preference: RV hero over the PREPARED BY card.</p>
  <div class="files">
    <div class="file">
      <div class="idx">0</div>
      <div>
        <div class="name">2022_Forest_River_Georgetown_328DS-hero.jpg · image/jpeg</div>
        <div class="meta">RV hero (Class A gas still) — preview winner</div>
      </div>
      <img class="thumb" src="${heroData}" alt="RV hero" />
    </div>
    <div class="file">
      <div class="idx">1</div>
      <div>
        <div class="name">2022_Forest_River_Georgetown_328DS-card.png · image/png · 1200×675 (16:9)</div>
        <div class="meta">PREPARED BY card — secondary, full readable card</div>
      </div>
      <canvas id="card" class="thumb" width="1200" height="675"></canvas>
    </div>
  </div>
  <p class="note">Lifestyle toggle may add a distinct lifestyle JPEG after the hero. Same-bytes lifestyle is deduped. Card is never files[0] when a hero exists.</p>
</div>
<script>${cardScript}</script>
</body></html>`;

const cardHtml = `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;background:#071018}canvas{display:block;width:1200px;height:675px}</style></head>
<body><canvas id="card" width="1200" height="675"></canvas><script>${cardScript}</script></body></html>`;

const shot = (html, name, width, height) => {
  const htmlPath = join(outDir, name.replace(/\.png$/, ".html"));
  writeFileSync(htmlPath, html);
  const dest = join(outDir, name);
  const r = spawnSync(
    "google-chrome",
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--hide-scrollbars",
      `--user-data-dir=/tmp/chrome-share-qa-${name.replace(/\W+/g, "")}`,
      `--window-size=${width},${height}`,
      `--screenshot=${dest}`,
      `file://${htmlPath}`,
    ],
    { encoding: "utf8", timeout: 25000 },
  );
  if (!existsSync(dest)) {
    console.error(r.stderr || r.stdout);
    throw new Error(`chrome screenshot failed for ${name} (status ${r.status})`);
  }
};
shot(kitHtml, "share-kit-text-hp-torque.png", 1280, 720);
shot(filesHtml, "share-files-order.png", 1280, 520);
shot(cardHtml, "share-signature-card-16x9.png", 1200, 675);
console.log("wrote share QA stills", { geoPower, fr3Power, outDir });
