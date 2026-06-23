# Building & publishing with EAS

How to take this template from a local Expo project to apps in the **App Store**
and **Google Play**, published under **your own** developer accounts. DOEH provides
the SDK, APIs, sandbox, this template, and the reference broker — you own the build
and the store listings.

EAS (Expo Application Services) builds the native binaries in the cloud, so you do
not need Xcode or Android Studio set up locally.

---

## 1. Prerequisites

- An [Expo account](https://expo.dev) (free) and the CLI: `npm i -g eas-cli`
- **Apple Developer Program** membership ($99/yr) — for iOS / App Store
- **Google Play Developer** account ($25 one-time) — for Android / Play
- Your branding done first ([BRANDING.md](./BRANDING.md)): `name`, `slug`,
  `scheme`, `ios.bundleIdentifier`, `android.package`, icon, and splash all come
  from `brand.json` — EAS reads them via `app.config.js`.

```bash
eas login
eas whoami        # confirm you're logged in
```

---

## 2. One-time project setup

```bash
eas init                 # links this project to an EAS project id
```

`eas.json` already ships with three build profiles (see §4) and uses
`appVersionSource: "remote"`, so EAS owns the build number / version code and bumps
it for you on production builds.

> The bundle id (`ios.bundleIdentifier`) and Android package (`android.package`)
> must be **globally unique** and match what you register in App Store Connect /
> the Play Console. Set them in `brand.json`.

---

## 3. Environment variables

`EXPO_PUBLIC_*` values are **compiled into the binary** (they are public — never
put a real `sk_live_` key in one; see [PRODUCTION.md](./PRODUCTION.md)).

| Variable | development / preview | production |
|---|---|---|
| `EXPO_PUBLIC_ENV` | `sandbox` (set in `eas.json`) | `production` (set in `eas.json`) |
| `EXPO_PUBLIC_DOEH_API_KEY` | a `sk_test_` key, for testing | **unset** — production uses the broker |
| `EXPO_PUBLIC_BROKER_URL` | — | your token broker URL |

`EXPO_PUBLIC_ENV` is already pinned per profile in `eas.json`. Set the others as
EAS environment variables (they persist across builds):

```bash
# Sandbox key for internal test builds (development / preview):
eas env:create --name EXPO_PUBLIC_DOEH_API_KEY --value sk_test_xxx \
  --environment development --environment preview --visibility plaintext

# Broker URL for production builds:
eas env:create --name EXPO_PUBLIC_BROKER_URL --value https://broker.yourbrand.com \
  --environment production --visibility plaintext
```

> These are `EXPO_PUBLIC_*`, so they are not secret — they ship in the app. The
> only true secret (`sk_live_`) lives in the broker, never here.

---

## 4. Build profiles (`eas.json`)

| Profile | Use | Env |
|---|---|---|
| `development` | Dev client for local iteration with native modules | `EXPO_PUBLIC_ENV=sandbox` |
| `preview` | Internal-distribution build to share with testers (TestFlight / internal APK) | `EXPO_PUBLIC_ENV=sandbox` |
| `production` | Store build, auto-incremented version | `EXPO_PUBLIC_ENV=production` |

---

## 5. Build

```bash
# Internal test build (sandbox) — share with your team:
eas build --profile preview --platform all

# Production store build:
eas build --profile production --platform ios       # or: android / all
```

On the first iOS build EAS offers to **manage your credentials** (signing certs +
provisioning profiles) — say yes unless you have a reason to bring your own. For
Android, EAS generates and stores a keystore for you (back it up).

When a build finishes, EAS gives you a URL to download the artifact or install it
on a device.

---

## 6. Submit to the stores

```bash
eas submit --profile production --platform ios       # → App Store Connect
eas submit --profile production --platform android   # → Google Play
```

You'll need, once per store:

- **iOS:** an app record in [App Store Connect](https://appstoreconnect.apple.com)
  with the same bundle id; your Apple Team ID (put it in `brand.json` `ios.teamId`).
- **Android:** an app in the [Play Console](https://play.google.com/console) and a
  Google service-account key for automated submits (EAS walks you through it).
- Both: store listing — name, description, screenshots, privacy policy. Your icon
  and splash come from `brand.json`.

---

## 7. Versioning & updates

- `appVersionSource: "remote"` + `autoIncrement` on the production profile means
  EAS manages the iOS build number and Android version code. Bump the
  user-facing `version` in `brand.json`-driven config when you want a new
  marketing version.
- **Over-the-air (OTA) JS updates** are optional and **not** wired in this template
  (it doesn't depend on `expo-updates`). If you want OTA, add `expo-updates` and
  configure EAS Update channels — out of scope here.

---

## 8. Sandbox → production cutover (recap)

1. Stand up your broker ([broker/README.md](../broker/README.md)) and set
   `EXPO_PUBLIC_BROKER_URL` for the `production` environment.
2. Make sure **no** `sk_live_` key is anywhere in the app or its env.
3. Build with `--profile production` (which sets `EXPO_PUBLIC_ENV=production`) and
   submit. No screen code changes — the app routes through the broker via the
   `baseUrl` seam in `src/api/client.ts`.

---

## 9. Troubleshooting

| Symptom | Likely cause |
|---|---|
| `API_KEY_ENV_MISMATCH` at runtime | a `sk_test_` key in a production build, or vice-versa — check `EXPO_PUBLIC_ENV` and the key |
| Production build can't reach the API | `EXPO_PUBLIC_BROKER_URL` unset, or the broker is down — see broker logs |
| iOS submit rejected: bundle id | `ios.bundleIdentifier` in `brand.json` doesn't match the App Store Connect record |
| Build picks up the wrong env | env var set for the wrong `--environment`; re-check `eas env:list` |
| Icon/splash not updating | replace `assets/icon.png` / `assets/splash.png`, then rebuild |

More: [docs.expo.dev/build/introduction](https://docs.expo.dev/build/introduction/).
