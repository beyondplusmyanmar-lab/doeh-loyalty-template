# Quickstart

From clone to a running loyalty app in a few minutes, against the DOEH **sandbox**.

## 1. Prerequisites

- Node 18+ and [pnpm](https://pnpm.io)
- The [Expo Go](https://expo.dev/go) app on your phone, or an iOS Simulator /
  Android emulator
- *(Optional for mock mode)* a DOEH **sandbox** API key (`sk_test_…`) with the
  **loyalty** module in scope. Mint one from the
  [developer portal](https://developers.doehpos.com) or with
  `api-client:mint --target-env=test`.

## 2. Bootstrap & run

```bash
git clone <your-fork> my-rewards-app
cd my-rewards-app
pnpm bootstrap            # installs deps, creates .env, checks Node/Expo
```

`pnpm bootstrap` is the one-command setup. Then run it one of two ways:

```bash
# A) Mock mode — no key, no network, in-memory data. Great for building the UI:
EXPO_PUBLIC_DOEH_MODE=mock pnpm start

# B) Against the real sandbox (needs an sk_test_ key — see step 3):
pnpm start
```

Press `i` (iOS), `a` (Android), or scan the QR with Expo Go.

## 3. Add your key (skip in mock mode)

Two options:

- **In-app (recommended):** open **Settings → Sandbox key**, paste `sk_test_…`,
  Save. It's stored in the device secure store (Keychain / Keystore), never logged.
- **Dev convenience:** copy `.env.example` to `.env` and set
  `EXPO_PUBLIC_DOEH_API_KEY=sk_test_…`. This prefills the key on reload.
  **Sandbox only** — `EXPO_PUBLIC_*` is compiled into the binary.

> **Mock mode** (`EXPO_PUBLIC_DOEH_MODE=mock`) swaps in an in-memory loyalty
> client so earn/redeem/history work with no key — it's a template convenience,
> not an SDK flag. Unset it to talk to the real API.

## 4. Use it

Open **Rewards**:

- **Look up balance** for a member id (letters/digits/underscore — a phone number
  works as an id).
- **Earn** — enter a purchase amount; the app converts it to points using the
  ratio in `brand.json` and calls `loyalty.earn`. The account is auto-provisioned.
- **Redeem** — spend points. Redeeming over the balance is rejected cleanly
  ("Insufficient points"); no points move.
- **History** — the ledger of earns/redeems.

## 5. Verify against the sandbox (optional)

Before building the UI on a device, you can confirm the loyalty flow works
end-to-end against the live sandbox — through the same SDK the app uses:

```bash
export DOEH_API_KEY=sk_test_…        # sandbox key with loyalty scope
pnpm smoke:loyalty
```

It runs lookup → earn-by-amount → read back → redeem → insufficient-points (409)
→ idempotent replay against a fresh member, using your `brand.json` points ratio.
Without a key it no-ops, so it's safe in CI. The key is read from the environment
and never written to disk.

## 6. Make it yours

- Branding: [BRANDING.md](./BRANDING.md)
- Production & the token broker: [PRODUCTION.md](./PRODUCTION.md)
- Building & submitting to the stores: [EAS.md](./EAS.md)

## Developer Tools (Sandbox Inspector)

In sandbox / mock builds, **Settings → Developer Tools → Sandbox Inspector** shows
environment, a member's balance + ledger, and (in **mock mode**) lets you seed or
reset state — handy while building screens. It's developer-only and hidden in
production builds. Tier shown there is a client-side demo, not a platform concept.

## Notes

- The app talks to the platform **only** through `@beyondplusmm/doehpos-sdk`
  (or the in-memory mock in mock mode).
- Sandbox data is isolated and reset daily — experiment freely.
- `pnpm doctor` validates your config (brand.json, bundle ids, assets, eas.json,
  env, key/broker posture) — run it before building.
- `pnpm check` runs both gates: `validate:brand` (schema) + `typecheck` (`tsc --noEmit`).
