# Branding (white-label)

Branding is **one file**: [`brand.json`](../brand.json). It is the single source of
truth — it drives both the in-app identity (`src/config/brand.ts`) and the
native/store identity (`app.config.js` → Expo config). You do **not** edit
`app.json`; there isn't one.

## 1. Edit `brand.json`

```jsonc
{
  "$schema": "./brand.schema.json",   // gives editor autocomplete + validation
  "name": "Acme Rewards",             // header, home, store listing
  "slug": "acme-rewards",             // Expo project slug (kebab-case)
  "scheme": "acmerewards",            // deep-link scheme (lowercase)
  "tagline": "Earn points every visit.",
  "icon": "./assets/icon.png",        // 1024x1024 PNG
  "splash": "./assets/splash.png",    // splash PNG
  "colors": {
    "primary": "#5b8cff",             // buttons, accents
    "bg": "#0b1020",                  // screen + splash background
    "card": "#161c2e"                 // cards / surfaces
  },
  "ios": {
    "bundleIdentifier": "com.acme.rewards",
    "teamId": "ABCDE12345"            // OPTIONAL — used by `eas submit`, not the binary
  },
  "android": { "package": "com.acme.rewards" },
  "loyalty": {
    "currencySymbol": "Ks",           // display only
    "pointsPerCurrencyUnit": 1        // points awarded per 1 unit of spend
  }
}
```

Where each field lands:

| `brand.json` | Drives |
|---|---|
| `name` / `slug` / `scheme` | Expo `name` / `slug` / `scheme` + app header |
| `colors.primary` / `bg` / `card` | The whole UI theme (`src/components/ui.tsx`) + splash & adaptive-icon background |
| `icon` / `splash` | App icon + splash image |
| `ios.bundleIdentifier` / `android.package` | Native app ids |
| `ios.teamId` | `eas submit` (not compiled into the binary) |
| `tagline` / `loyalty.*` | Home screen + points scheme |

> `pointsPerCurrencyUnit` is applied **client-side** before calling
> `loyalty.earn(points)` — the API takes points, not currency.

## 2. Validate

```bash
pnpm validate:brand     # checks brand.json against brand.schema.json
```

Validation is enforced two ways, so a bad brand fails fast — not at App Store
review:

- **`brand.schema.json`** — the authoritative contract. `pnpm validate:brand`
  (ajv) reports exactly which field is wrong. Run it in CI / before publishing.
- **Runtime backstop** — `src/config/brand.ts` re-checks the fields the UI reads
  and **throws at load** (failing the build) if they're malformed.

The `$schema` line also gives you live validation + autocomplete in VS Code and
most editors while you type.

## 3. Replace the assets

Swap the placeholders in [`assets/`](../assets): `icon.png` (1024×1024) and
`splash.png` (centered on your `colors.bg`).

## Checklist

- [ ] `brand.json` edited
- [ ] `pnpm validate:brand` passes
- [ ] `assets/icon.png` and `assets/splash.png` replaced
- [ ] `pnpm typecheck` passes, app launches and looks right

That's the entire white-label swap — no screen or config code changes.
