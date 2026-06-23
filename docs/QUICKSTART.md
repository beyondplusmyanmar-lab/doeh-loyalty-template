# Quickstart

From clone to a running loyalty app in a few minutes, against the DOEH **sandbox**.

## 1. Prerequisites

- Node 18+ and [pnpm](https://pnpm.io)
- The [Expo Go](https://expo.dev/go) app on your phone, or an iOS Simulator /
  Android emulator
- A DOEH **sandbox** API key (`sk_test_…`) with the **loyalty** module in scope.
  Mint one from the [developer portal](https://developers.doehpos.com) or with
  `api-client:mint --target-env=test`.

## 2. Install & run

```bash
git clone <your-fork> my-rewards-app
cd my-rewards-app
pnpm install
pnpm start
```

Press `i` (iOS), `a` (Android), or scan the QR with Expo Go.

## 3. Add your key

Two options:

- **In-app (recommended):** open **Settings → Sandbox key**, paste `sk_test_…`,
  Save. It's stored in the device secure store (Keychain / Keystore), never logged.
- **Dev convenience:** copy `.env.example` to `.env` and set
  `EXPO_PUBLIC_DOEH_API_KEY=sk_test_…`. This prefills the key on reload.
  **Sandbox only** — `EXPO_PUBLIC_*` is compiled into the binary.

## 4. Use it

Open **Rewards**:

- **Look up balance** for a member id (letters/digits/underscore — a phone number
  works as an id).
- **Earn** — enter a purchase amount; the app converts it to points using the
  ratio in `brand.json` and calls `loyalty.earn`. The account is auto-provisioned.
- **Redeem** — spend points. Redeeming over the balance is rejected cleanly
  ("Insufficient points"); no points move.
- **History** — the ledger of earns/redeems.

## 5. Make it yours

- Branding: [BRANDING.md](./BRANDING.md)
- Shipping to the stores: [PRODUCTION.md](./PRODUCTION.md)

## Notes

- The app talks to the platform **only** through `@beyondplusmm/doehpos-sdk`.
- Sandbox data is isolated and reset daily — experiment freely.
- `typecheck` runs `tsc --noEmit`: `pnpm typecheck`.
