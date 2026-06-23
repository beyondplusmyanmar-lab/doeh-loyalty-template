# DOEH Loyalty Template

A **clone-and-own** merchant loyalty app for the [DOEH platform](https://developers.doehpos.com).
Fork it, drop in your brand and a key, run EAS Build, and publish under **your own**
Apple / Google accounts. DOEH provides the SDK, APIs, sandbox, and this template —
**you** own the app.

> Status: **v1 — Loyalty Starter.** A complete, store-publishable loyalty app:
> SDK-first screens, one-file branding, a reference token broker for production,
> and EAS build/submit docs. It's the durable frame that grows into the full
> Merchant Mobile Starter Kit as platform capabilities ship. See [`docs/`](./docs)
> and the epic spec in the SDK repo (`docs/MERCHANT-STARTER-KIT-EPIC.md`).

> **New here? Start with [docs/ONBOARDING.md](./docs/ONBOARDING.md)** — the
> clone-to-published-app journey, with a checklist and links to each step.

## What it does today

- **Loyalty** — look up a member, earn points (by purchase amount → points), redeem
  points, and read the history ledger. Backed by the stable `loyalty` SDK module.
- **Branding** — name, colours, native ids, and points scheme all live in **one**
  schema-validated file, `brand.json` (single source of truth for the app *and* the
  Expo build). A swap takes a couple of minutes (see [docs/BRANDING.md](./docs/BRANDING.md)).
- **SDK-first** — every network call goes through `@beyondplusmm/doehpos-sdk`.
  There is **no raw HTTP** anywhere in the app.

## What's intentionally gated

Sign in, Shop (catalog), and Cart ship as **flagged-off stubs** — visible parts of
the frame that make **no API calls**, because the platform surface behind them does
not exist yet. They turn on when their epics ship (`src/config/features.ts`).

## Quick start

```bash
git clone <your-fork> my-rewards-app && cd my-rewards-app
pnpm install
cp .env.example .env        # optional: prefill a sandbox key
pnpm start                  # press i / a, or scan the QR
```

Paste an `sk_test_` key in **Settings** (or set `EXPO_PUBLIC_DOEH_API_KEY` in `.env`),
then open **Rewards**. Full walkthrough: [docs/QUICKSTART.md](./docs/QUICKSTART.md).

## Going to production

The app **never** embeds an `sk_live_` key. Production publishing uses a thin
**token broker** you run (shipped in [`broker/`](./broker)) — it holds the secret
server-side and issues short-lived tokens to the app. See
[docs/PRODUCTION.md](./docs/PRODUCTION.md), [docs/EAS.md](./docs/EAS.md) (build &
submit), and [broker/README.md](./broker/README.md).

## Layout

```
app/              expo-router screens (index, loyalty, settings + gated stubs)
src/api/          SDK client factory (the only network seam)
src/hooks/        useDoehClient, useLoyalty
src/store/        secure credential store
src/config/       brand, env, feature flags
src/components/   themed UI kit (colours from brand.json)
brand.json        ← your white-label config (single source of truth)
brand.schema.json JSON schema for brand.json (editor + CI validation)
app.config.js     derives the Expo/native config from brand.json
scripts/          validate-brand.mjs, loyalty.smoke.mjs
broker/           reference token broker for production (you deploy + own it)
docs/             ONBOARDING · QUICKSTART · BRANDING · PRODUCTION · EAS
```

## License

See [LICENSE](./LICENSE).
