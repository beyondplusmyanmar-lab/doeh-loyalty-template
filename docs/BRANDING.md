# Branding (white-label)

Making the app yours is two files: `brand.json` (in-app identity) and `app.json`
(store identity + native ids), plus three image assets.

## 1. `brand.json`

```jsonc
{
  "name": "Acme Rewards",            // shown in the header + home
  "tagline": "Earn points every visit.",
  "colors": {
    "primary": "#5b8cff",            // buttons, accents
    "bg": "#0b1020",                 // screen background
    "card": "#161c2e"                // cards / surfaces
  },
  "loyalty": {
    "currencySymbol": "Ks",          // display only
    "pointsPerCurrencyUnit": 1       // points awarded per 1 unit of spend
  }
}
```

Validation runs at load (`src/config/brand.ts`): a missing field or a malformed
hex colour **throws immediately**, so a bad brand fails your build — not the
App Store review. Colours flow into the whole UI through `src/components/ui.tsx`.

> `pointsPerCurrencyUnit` is applied **client-side** before calling
> `loyalty.earn(points)` — the API takes points, not currency.

## 2. `app.json` (store + native identity)

Update these to your own values:

| Field | What |
|---|---|
| `expo.name` | App display name |
| `expo.slug` | Expo project slug |
| `expo.scheme` | Deep-link scheme |
| `expo.ios.bundleIdentifier` | Your iOS bundle id |
| `expo.android.package` | Your Android package |
| `expo.splash.backgroundColor` | Match `brand.json` `colors.bg` |

## 3. Assets

Replace the placeholders in `assets/`:

- `icon.png` — 1024×1024 app icon
- `splash.png` — splash image (centered, on `colors.bg`)

## Checklist

- [ ] `brand.json` edited and valid (`pnpm typecheck` passes)
- [ ] `app.json` name / slug / scheme / bundle id / package set
- [ ] `assets/icon.png` and `assets/splash.png` replaced
- [ ] Launched and visually confirmed

That's the whole white-label swap — no screen code changes required.
