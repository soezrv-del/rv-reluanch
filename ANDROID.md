# RVFAX — Android Studio (Capacitor)

This export includes the full web app source **and** a native `android/` project generated with Capacitor 8.

## Open in Android Studio

1. Install [Android Studio](https://developer.android.com/studio) (Hedgehog or newer recommended).
2. Install **JDK 17** (Android Studio’s bundled JDK is fine).
3. Unzip this archive.
4. In Terminal:

```bash
cd rvfax-android-export   # or whatever folder name you extracted
npm install
```

5. Point the WebView at your **live** hosted app (required for chat, voice, APIs):

```bash
export CAP_SERVER_URL="https://YOUR-LIVE-APP.vercel.app"
npm run cap:sync:android
```

6. Open the native project:

```bash
npm run cap:open:android
# or: Android Studio → Open → select the `android/` folder
```

7. Wait for Gradle sync, pick an emulator or USB device, press **Run**.

### Without CAP_SERVER_URL

The shell still loads local `cap-www` assets (brand shell only). Live Grok / NHTSA / OSRM / MarketCheck need the hosted URL.

### Local env

Copy `.env.example` → `.env` and fill secrets **for the web server only**.  
Do **not** bake API keys into the Android APK.

### App IDs

| | |
|--|--|
| Application ID | `com.markclass.rvfax` |
| App name | RVFAX |

### Play Console beta (internal testing)

1. `Build → Generate Signed Bundle / APK` → **Android App Bundle**
2. Upload the `.aab` to Play Console → **Internal testing**
3. Add testers by email

### iOS note

The `ios/` folder is included for parity; open that in **Xcode** on a Mac, not Android Studio.
