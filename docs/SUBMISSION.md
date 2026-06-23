# Submitting your app — TestFlight & Play checklist

A pre-flight checklist for getting your branded loyalty app into Apple TestFlight
and Google Play testing, then to store review. Assumes you've finished
[BRANDING.md](./BRANDING.md), stood up your broker ([broker/README.md](../broker/README.md)),
and read [EAS.md](./EAS.md).

## 0. DOEH pre-flight (do these first)

- [ ] `pnpm check` and `pnpm smoke:loyalty` (with a sandbox key) are green
- [ ] `brand.json` final: `name`, `slug`, `scheme`, `ios.bundleIdentifier`, `android.package`, `ios.teamId`, icon, splash, points ratio
- [ ] Production icon (1024×1024, no alpha for iOS) and splash replaced in `assets/`
- [ ] **No `sk_live_` anywhere in the app or its EAS env** (grep the repo + `eas env:list`)
- [ ] Broker deployed, `/healthz` responds, `npm test` green, **device-auth stub replaced**
- [ ] `EXPO_PUBLIC_BROKER_URL` set for the `production` environment; `EXPO_PUBLIC_ENV=production` (pinned in `eas.json`)
- [ ] Bundle id / package are **globally unique** and match the store records you create below

## 1. Accounts & one-time setup

- [ ] Apple Developer Program active ($99/yr); Team ID matches `brand.json`
- [ ] Google Play Developer account active ($25 one-time)
- [ ] `eas login` / `eas whoami` confirmed; `eas init` has linked the project

## 2. iOS → TestFlight

- [ ] App record created in **App Store Connect** with the matching bundle id
- [ ] Build: `eas build --profile production --platform ios`
- [ ] Submit: `eas submit --profile production --platform ios`
- [ ] Build appears in App Store Connect → **TestFlight** (wait for "processing" to finish)
- [ ] **Export compliance** answered (this app uses only standard HTTPS → typically "no" to custom encryption; confirm for your case)
- [ ] Internal testers added (no review needed) — verify install + launch
- [ ] For external testers / public link: complete **Beta App Review** info (see §4)
- [ ] Test on a real device: earn → balance → redeem works against your broker

## 3. Android → Google Play

- [ ] App created in **Play Console** with the matching package name
- [ ] First upload sets up **app signing** (let Google manage; back up your upload key)
- [ ] Build: `eas build --profile production --platform android`
- [ ] Submit: `eas submit --profile production --platform android` (needs a Google service-account key — EAS walks you through it)
- [ ] Release to **Internal testing** track; add tester emails / opt-in link
- [ ] Complete required Play declarations (see §4) — these gate even internal→closed/production promotion
- [ ] Install via the tester link; verify earn → balance → redeem

## 4. Store review gotchas (both platforms)

- [ ] **Privacy policy URL** — required by both. Disclose what you collect (loyalty member ids, points; broker/auth data)
- [ ] **Apple Privacy "Nutrition Label"** (App Store Connect → App Privacy) filled in
- [ ] **Google Play Data Safety form** filled in (must match actual data handling)
- [ ] **Account deletion** — if the app has user accounts, both stores require an in-app or documented deletion path (relevant once you wire real device/user auth in the broker)
- [ ] **Reviewer access** — give review notes explaining the loyalty flow and a **demo member id** to use (e.g. `LOYALTY_DEMO_001`); if production requires broker sign-in, provide demo device credentials so the reviewer can exercise it
- [ ] App name, subtitle/short description, full description, keywords
- [ ] Screenshots for required device sizes (iPhone 6.7"/6.5"; Android phone) — capture from a branded build
- [ ] Age rating / content rating questionnaire completed
- [ ] Support URL and contact email
- [ ] No placeholder/"Acme Rewards" text or stock assets left in the build

## 5. Post-submission

- [ ] Note the submitted build number/version (EAS `appVersionSource: remote` tracks it)
- [ ] Monitor broker logs during beta — confirm token issue/refresh and proxied calls
- [ ] Have a rollback plan: keep the previous build; rotate `sk_live_` if ever exposed
- [ ] Collect tester feedback before promoting Internal → Closed → Production

---

## Template-specific notes

- **Loyalty has no consumer login.** Members are identified by a merchant-supplied
  id, so a reviewer can use the app immediately with a demo member id — you usually
  don't need a full demo-account flow *unless* you've added broker sign-in. That
  simplifies the reviewer-access item in §4.
- **The account-deletion requirement** only applies once you add real user/device
  accounts in the broker; the shipped stub creates no end-user accounts.
- **Export compliance** is normally trivial here (standard HTTPS only), but you
  must still answer it.
