# RVFAX — update Xcode / TestFlight (latest web + Grok)

Your **native launch / splash video is fine — leave AppDelegate, Info.plist, and LaunchScreen alone.**

## What actually updates the app

TestFlight is a **native shell**. Screens, Fax report, navigation, and **Live Grok** come from your **hosted web app** (`CAP_SERVER_URL`).

So you need **two** steps:

1. **Deploy this build** (Vercel / whatever hosts the suite)  
2. **Sync Capacitor** only if you changed native shell files (usually **not** this time)

---

## A) Deploy the new code (required for Live Grok + new Fax)

On the machine that deploys (or connect Git → Vercel auto-deploy):

```bash
# from project root
npm install
npm run build
# then deploy .vercel/output (or your usual Vercel git push)
```

Env vars on the host (same as before):

| Variable | Purpose |
|----------|---------|
| `CLOUDFLARE_WORKER_URL` | Live Grok chat + **new** `/api/rvfax/dossier` |
| `VITE_CLOUDFLARE_WORKER_URL` | Same URL for client hints if used |
| `XAI_API_KEY` | Optional fallback if worker is down |

**Do not** touch launch screen files for this update.

---

## B) Refresh Xcode project (only if you use local `ios/` from this zip)

```bash
cd /path/to/rvfax-xcode-update   # unzipped folder
export CAP_SERVER_URL="https://YOUR-LIVE-APP.vercel.app"   # your real URL
chmod +x scripts/cap-mac.sh
./scripts/cap-mac.sh "$CAP_SERVER_URL"
```

Or:

```bash
export CAP_SERVER_URL="https://YOUR-LIVE-APP.vercel.app"
npm install
npm run cap:sync
npx cap open ios
```

In Xcode:

1. **Signing & Capabilities** → your Team  
2. Bundle ID stays `com.markclass.rvfax`  
3. **Product → Archive → Distribute → App Store Connect / TestFlight**

### Skip these (already working for you)

- `AppDelegate.swift`  
- `Info.plist` launch keys  
- LaunchScreen / splash storyboard  
- Video splash assets  

---

## C) Fast path if only web changed

If TestFlight already points at `CAP_SERVER_URL` and you only deploy Vercel:

→ **Users get the new Fax + Live Grok on next app open** without a new TestFlight build.

Ship a new TestFlight build when you want the store binary refreshed or native config changed.

---

## Smoke-check after deploy

1. Open app → video splash still plays  
2. Bottom tabs: Grok · Fax · Cal · Tow · Trips · More  
3. **Fax** → year/make/model → detail report  
4. Banner should say **LIVE GROK** and fill engine/chassis/reliability  
5. **Grok** tab chat still works (same worker)

