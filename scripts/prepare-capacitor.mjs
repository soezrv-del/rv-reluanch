#!/usr/bin/env node
/**
 * Builds a local Capacitor webDir (cap-www/) with:
 * - App icon / splash branding
 * - Fallback shell if CAP_SERVER_URL is not set
 * - Copies public brand assets for offline chrome
 */
import { cpSync, existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const out = join(root, "cap-www");
const brandIcon = join(root, "public/assets/brand/icon-rvfax.png");
const splashBg = join(root, "src/assets/backdrops/shared-prestige.jpg");

if (existsSync(out)) rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
mkdirSync(join(out, "assets"), { recursive: true });

if (existsSync(brandIcon)) {
  cpSync(brandIcon, join(out, "assets/icon.png"));
}
if (existsSync(splashBg)) {
  cpSync(splashBg, join(out, "assets/splash.jpg"));
}

const serverUrl = process.env.CAP_SERVER_URL?.trim() || "";

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="theme-color" content="#050508" />
  <title>RVFAX</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      height: 100%;
      background: #050508;
      color: #fff;
      font-family: system-ui, -apple-system, "SF Pro Display", sans-serif;
      overflow: hidden;
    }
    .shell {
      min-height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 24px;
      text-align: center;
      background:
        radial-gradient(ellipse at 50% 20%, rgba(80,140,255,0.18), transparent 50%),
        #050508;
    }
    .logo {
      width: 96px; height: 96px;
      object-fit: contain;
      border-radius: 22px;
      box-shadow: 0 0 40px rgba(80,140,255,0.35);
      margin-bottom: 20px;
    }
    h1 {
      font-size: 28px;
      letter-spacing: 0.04em;
      margin-bottom: 8px;
    }
    p {
      max-width: 320px;
      font-size: 14px;
      line-height: 1.5;
      color: rgba(255,255,255,0.72);
      margin-bottom: 12px;
    }
    code {
      display: inline-block;
      margin-top: 8px;
      padding: 8px 12px;
      border-radius: 10px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      font-size: 11px;
      color: #8ec0ff;
      word-break: break-all;
    }
    .hint { font-size: 12px; color: rgba(255,255,255,0.45); margin-top: 20px; }
  </style>
</head>
<body>
  <div class="shell">
    <img class="logo" src="./assets/icon.png" alt="RVFAX" onerror="this.style.display='none'" />
    <h1>RVFAX</h1>
    ${
      serverUrl
        ? `<p>Connecting to live suite…</p>
           <code>${serverUrl.replace(/</g, "")}</code>
           <script>location.replace(${JSON.stringify(serverUrl)});</script>`
        : `<p>Native shell is ready. Point Capacitor at your hosted app so chat, voice, and search load inside TestFlight.</p>
           <p>On your Mac, set:</p>
           <code>export CAP_SERVER_URL=https://your-live-app.vercel.app</code>
           <p class="hint">Then: npm run cap:sync && npm run cap:open</p>`
    }
  </div>
</body>
</html>
`;

writeFileSync(join(out, "index.html"), html);
console.log(
  `[prepare-capacitor] wrote ${out}${serverUrl ? ` → server ${serverUrl}` : " (local shell; set CAP_SERVER_URL for live app)"}`,
);
