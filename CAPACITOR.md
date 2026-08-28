# Capacitor setup — RVFAX → iPhone / TestFlight

Capacitor is **already wired** in this repo:

| File / folder | Purpose |
|---|---|
| [`capacitor.config.ts`](capacitor.config.ts) | App ID, splash, live server URL |
| [`cap-www/`](cap-www/) | Local webDir (shell / redirect) |
| [`ios/`](ios/) | Xcode project |
| [`scripts/prepare-capacitor.mjs`](scripts/prepare-capacitor.mjs) | Builds `cap-www` |
| [`scripts/cap-mac.sh`](scripts/cap-mac.sh) | One-shot Mac setup |
| [`TESTFLIGHT.md`](TESTFLIGHT.md) | Full Xcode + TestFlight walkthrough |

**This Linux sandbox cannot run Xcode.** Run the commands below on your **Mac**.

---

## Exact Terminal commands (Mac)

### A) First time

```bash
# 1) Open project folder
cd ~/path/to/rvfax

# 2) Install deps
npm install

# 3) Point at your LIVE deployed app (Vercel HTTPS — no trailing slash)
export CAP_SERVER_URL="https://YOUR-APP.vercel.app"

# 4) Build native shell + sync into iOS
npm run cap:prepare
npx cap add ios          # skip if ios/ already exists
npm run cap:sync
npm run cap:open
```

**Or one script:**

```bash
chmod +x scripts/cap-mac.sh
./scripts/cap-mac.sh https://YOUR-APP.vercel.app
```

### B) Every update after you redeploy the web app

```bash
export CAP_SERVER_URL="https://YOUR-APP.vercel.app"
npm run cap:sync
npm run cap:open
# In Xcode: bump Build number → Product → Archive → Upload
```

### C) npm scripts reference

```bash
npm run cap:prepare   # writes cap-www/ with branding + CAP_SERVER_URL redirect
npm run cap:sync      # prepare + npx cap sync ios
npm run cap:copy      # prepare + copy assets only
npm run cap:open      # open Xcode
```

---

## What `CAP_SERVER_URL` means

RVFAX uses **server APIs** (chat, voice token, NHTSA, OSRM, lenders).  
The iPhone app is a **native WebView shell** that loads your **live HTTPS site**.

| Setting | Behavior |
|---|---|
| `CAP_SERVER_URL` set | App opens your live suite (full features) |
| Not set | Local placeholder shell only — no live chat |

---

## Xcode (short)

1. **Signing & Capabilities** → Team = your Apple membership  
2. Bundle ID = `com.markclass.rvfax` (or change in `capacitor.config.ts` **before** first listing)  
3. Version `1.0.0`, Build `1`  
4. **Product → Archive** → **Distribute App** → App Store Connect  
5. [App Store Connect](https://appstoreconnect.apple.com) → **TestFlight** → wait for processing → invite testers  

Mic permissions are already in `ios/App/App/Info.plist`.

---

## Already installed packages

```text
@capacitor/core
@capacitor/cli
@capacitor/ios
@capacitor/app
@capacitor/keyboard
@capacitor/splash-screen
@capacitor/status-bar
```

Android is optional later:

```bash
npm i @capacitor/android
npx cap add android
npx cap sync android
```

---

## Common issues

| Problem | Fix |
|---|---|
| Blank app / only shell | Set `CAP_SERVER_URL` and re-run `npm run cap:sync` |
| Chat fails | Deploy worker + app; open the same URL in Safari first |
| Mic denied | Settings → RVFAX → Microphone ON |
| Signing error | Pick correct Team; unique Bundle ID |
| Old UI in TestFlight | Bump **Build** number; re-Archive |

More detail: **[TESTFLIGHT.md](TESTFLIGHT.md)**
