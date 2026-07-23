# Google Play release guide

## Prerequisites

- Java 17 (`JAVA_HOME` pointing to JDK 17)
- Android SDK / Android Studio
- Node.js 20+
- Upload keystore for Play signing (create once, keep offline backups)

## Create upload keystore (once)

```bash
keytool -genkey -v \
  -keystore android/upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias upload
```

Copy the example properties and fill secrets (file is gitignored):

```bash
cp android/keystore.properties.example android/keystore.properties
```

## Local release build (AAB for Play Console)

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64   # adjust path
npm ci
npm run build:prod
npx cap sync android
npm run android:bundle:release
```

Output:

- `android/app/build/outputs/bundle/release/app-release.aab`

Without `keystore.properties`, Gradle still produces an AAB/APK but it is **unsigned** (or debug-signed). Play Console requires an app signed with your upload key (or Play App Signing).

## CI secrets (optional)

For signed CI builds, add GitHub Actions secrets:

- `ANDROID_KEYSTORE_BASE64` — base64 of `upload-keystore.jks`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Workflow: `.github/workflows/build-android.yml` builds debug APK, release APK, and release AAB on non-PR runs. `release/**` branches are included.

## Play Console checklist

1. Create app with package `com.fogofwar.app`
2. Enable Play App Signing
3. Upload signed `app-release.aab` to Internal testing first
4. Store listing: use texts and assets from [`store/play/LISTING.md`](../store/play/LISTING.md)
5. Privacy policy URL (GitHub Pages): `https://wilkuuu.github.io/fog-of-war/` — bilingual EN/PL in `docs/index.html`. Enable Pages (Settings → Pages → Deploy from branch `main`, folder `/docs`)
6. Complete Data safety, content rating, target audience, news app / COVID / Data safety forms
7. Declare Photos/Videos access as user-selected, not shared
8. Promote Internal → Closed → Production when ready

## Versioning

- `package.json` `version` → marketing version name base (`1.0.0`)
- Gradle `versionCode` / `versionName` overridable via `-PVERSION_CODE` / `-PVERSION_NAME`
- CI sets `versionCode = run_number * 1000`
