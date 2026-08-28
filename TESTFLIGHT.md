# RVFAX → Xcode → TestFlight

> Quick command sheet: **[CAPACITOR.md](CAPACITOR.md)** · one-shot Mac script: `./scripts/cap-mac.sh https://…`

This project is wrapped with **Capacitor** so you can open it in **Xcode** and ship to **TestFlight**.

## What you need

- Mac with **Xcode** (App Store)
- **Apple Developer** membership (you already have this)
- A **live HTTPS URL** for the app (Vercel / your domain) — required for chat, voice, VIN, ZIP tax

---

## One-time on your Mac

### 1. Get the project onto the Mac

```bash
cd /path/to/rvfax
npm install
```

### 2. Point at your live app

```bash
export CAP_SERVER_URL="https://YOUR-DEPLOYED-APP.vercel.app"
```

Use the real URL where RVFAX is published (no trailing slash).

### 3. Prepare + sync iOS

```bash
npm run cap:prepare
npx cap add ios          # first time only (skip if ios/ exists)
npm run cap:sync
npm run cap:open
```

Xcode opens the `ios/App` project.

---

## In Xcode

1. Left sidebar → **App** (blue project icon)
2. Target **App** → **Signing & Capabilities**
3. **Team** → your Apple team
4. **Bundle Identifier** → `com.markclass.rvfax`  
   (or change it — must match App Store Connect)
5. Check **Automatically manage signing**
6. Set **Version** `1.0.0` and **Build** `1` (or bump Build each upload)

### Critical: Main Interface must NOT be LaunchScreen

If the console shows:

```text
Failed to instantiate the default view controller for
UIMainStoryboardFile 'LaunchScreen'
```

then **Main Interface** was set to the launch storyboard (crash on launch).

**Fix (already in this repo):**

- `Info.plist` has **only** `UILaunchStoryboardName = LaunchScreen` (no main storyboard key)
- `AppDelegate` creates `CAPBridgeViewController` in code

In Xcode still verify:

1. Target **App** → **General** → **Deployment Info**
2. **Main Interface** / **Main storyboard** field → **leave blank** (or `Main` only if present — **never** `LaunchScreen`)
3. **Product → Clean Build Folder** (⇧⌘K)
4. Run again on device

### Microphone (RV Grok voice)

`Info.plist` includes:

- `NSMicrophoneUsageDescription`
- `NSSpeechRecognitionUsageDescription`
- `NSCameraUsageDescription`

### Run on your iPhone

1. Plug in phone → Trust
2. Top bar: select your iPhone
3. ▶ Run
4. Trust developer cert on phone if prompted

---

## App Store Connect + TestFlight

1. [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **My Apps** → **+** → New App  
   - Platform: iOS  
   - Name: **RVFAX**  
   - Bundle ID: same as Xcode  
   - SKU: any unique string  

2. In Xcode: device menu → **Any iOS Device (arm64)**  
   → **Product → Archive**

3. Organizer → **Distribute App** → **App Store Connect** → **Upload**

4. App Store Connect → **TestFlight** → wait for **Processing**

5. Answer **Export Compliance** if asked (HTTPS-only → usually “No” custom encryption)

6. Add **Internal** testers (instant) or **External** (Beta Review)

7. Install **TestFlight** on the phone → accept invite → Install RVFAX

---

## Day-to-day updates

After you change the web app and redeploy:

```bash
export CAP_SERVER_URL="https://YOUR-DEPLOYED-APP.vercel.app"
npm run cap:sync
npm run cap:open
# bump Build number in Xcode, Archive, Upload again
```

---

## Scripts

| Command | What it does |
|--------|----------------|
| `npm run cap:prepare` | Builds `cap-www/` shell + branding |
| `npm run cap:sync` | prepare + `cap sync ios` |
| `npm run cap:open` | Opens Xcode |

---

## Important

- TestFlight builds a **native shell**. The full RVFAX experience loads from **`CAP_SERVER_URL`**.
- Without `CAP_SERVER_URL` at sync time, the app only shows a placeholder shell.
- Chat / voice / NHTSA need that live server + your Cloudflare worker.
- Change `appId` in `capacitor.config.ts` before first App Store listing if you want a different bundle ID.
