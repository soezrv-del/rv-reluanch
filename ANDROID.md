# Open RVFAX in Android Studio

The Android app is a **phone window** that shows the **live RVFAX website**. You are not building a new website. You are opening the Android wrapper so you can Run it on an emulator or a USB phone.

Do these steps **in order**. Skip a step and Gradle (the Android build) will complain.

---

## You need

- This project folder, named **`rv-reluanch`**
- [Android Studio](https://developer.android.com/studio) (Hedgehog or newer). Its bundled JDK is fine.
- The **live RVFAX web address** — the `https://….vercel.app` URL the website already uses. That is `CAP_SERVER_URL`.

You do **not** need API keys, a `.env` file, or to run a web server on this computer. Secrets stay on the hosted site. Do **not** put keys in the Android app.

---

## Checklist (first time)

### 1. Open a Terminal in the project folder

```bash
cd rv-reluanch
```

If the folder is already open, you are done with this step.

### 2. Install the phone-app packages

```bash
npm install
```

This downloads `@capacitor/android` so Android Studio can find the native library. Wait until it finishes.

### 3. Point the phone window at the live website

Replace the URL with your real live address. No slash at the end.

```bash
export CAP_SERVER_URL="https://YOUR-LIVE-APP.vercel.app"
npm run cap:sync:android
```

`cap:sync:android` writes the website address into the Android project. Without this, the phone only shows a local “shell” screen — no Grok, VIN scan, or Trips.

### 4. Open Android Studio

```bash
npm run cap:open:android
```

Or: **Android Studio → Open** → choose the **`android`** folder inside `rv-reluanch` (not the outer folder).

### 5. Wait for Gradle sync

The bottom of Android Studio will show a progress bar (“Gradle sync”). Let it finish. The first time can take several minutes while it downloads Android bits.

If it says it cannot find `:capacitor-android`, go back to step 2 (`npm install`) and step 3 (`cap:sync:android`), then **File → Sync Project with Gradle Files**.

### 6. Run it

1. Top toolbar: pick an **emulator** (virtual phone) **or** plug in a real Android phone with **USB debugging** on.
2. Press the green **Run** (play) button.
3. When the app asks for **Camera**, **Microphone**, or **Location**, tap **Allow** — VIN scan, Grok voice, and nearby dump stations need those.

---

## Every time the live website changes

You do **not** rebuild Android just to pick up a Vercel deploy. The phone already loads the live URL.

Only redo steps 3–6 if you change the live address, or someone updates the Android wrapper in this repo.

```bash
cd rv-reluanch
export CAP_SERVER_URL="https://YOUR-LIVE-APP.vercel.app"
npm run cap:sync:android
npm run cap:open:android
```

Then Run again.

---

## If the app looks empty

The live address was missing at sync time. Repeat step 3 with the real `https://` URL.

---

## Optional: local website secrets (not for the phone)

`.env.example` is a **blank template** if someone runs the **website** on this computer. Copy it to `.env` only for that. The Android APK must stay free of API keys.

---

## App IDs

| | |
|--|--|
| Application ID | `com.markclass.rvfax` |
| Name on the phone | RVFAX |

---

## Later: Play Console internal testers

1. **Build → Generate Signed Bundle / APK** → **Android App Bundle**
2. Upload the `.aab` to Play Console → **Internal testing**
3. Add testers by email

---

## iPhone

The `ios/` folder is for **Xcode on a Mac**, not Android Studio. See `TESTFLIGHT.md`.
