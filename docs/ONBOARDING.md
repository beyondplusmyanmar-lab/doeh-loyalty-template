# Merchant onboarding — clone to published app

This is the **start here** guide for a merchant's developer. It's the map; each
stage links to the detailed doc that does the work. Follow it top to bottom and
you'll go from a fresh clone to a branded loyalty app live in the App Store and
Google Play.

---

## The mental model

DOEH is a **platform**, not an app you rent. You build and own a real app on top
of it.

| DOEH provides | You own |
|---|---|
| The SDK (`@beyondplusmm/doehpos-sdk`) | Your app — code, branding, store listings |
| The APIs + sandbox | Your Apple / Google developer accounts |
| This template + reference broker | Your broker deployment, domain, and secrets |
| The loyalty capability | Your loyalty rules (points ratio, rewards) |

One credential, one shop: an API **key is the shop** — there is no shop selector,
no `shopId` anywhere. Sandbox uses a `sk_test_` key; production keeps the secret
`sk_live_` key in your broker, never in the app.

---

## The journey

### Stage 0 — Prerequisites
Node 18+, [pnpm](https://pnpm.io), and the [Expo Go](https://expo.dev/go) app or a
simulator. For shipping later: Apple Developer ($99/yr) and Google Play ($25)
accounts.

### Stage 1 — Get a sandbox key
Mint a **sandbox** `sk_test_` key with the **loyalty** module in scope from the
[developer portal](https://developers.doehpos.com). This is all you need to run
everything below — no production access required to build and test.

### Stage 2 — Clone & run → [QUICKSTART.md](./QUICKSTART.md)
Clone, `pnpm install`, paste the key in Settings, open **Rewards**. You should be
earning and redeeming points against the sandbox within a few minutes.
✅ **Checkpoint:** points earn, redeem, and the balance reads back.

### Stage 3 — Make it yours → [BRANDING.md](./BRANDING.md)
Edit one file, `brand.json` (name, colours, native ids, icon/splash, points
ratio). Run `pnpm validate:brand`. Replace the placeholder assets.
✅ **Checkpoint:** `pnpm validate:brand` passes and the app shows your brand.

### Stage 4 — Verify against the sandbox → [QUICKSTART.md §5](./QUICKSTART.md)
Run `DOEH_API_KEY=sk_test_… pnpm smoke:loyalty` to exercise the full flow
(earn-by-amount → redeem → insufficient-points → idempotent replay) end-to-end.
✅ **Checkpoint:** the smoke check is green.

### Stage 5 — Know what's in scope
Today's app is a **Loyalty Starter**. Sign in, Shop (catalog), and Cart appear as
**"coming soon" stubs** — they're part of the frame but make no API calls, because
the platform capability behind them isn't available yet. You don't need to do
anything with them; they light up when their platform epics ship.

### Stage 6 — Stand up your broker → [broker/README.md](../broker/README.md) · [PRODUCTION.md](./PRODUCTION.md)
Production never embeds `sk_live_`. Deploy the reference token broker (it holds the
secret and issues short-lived tokens to the app), then **replace the device-auth
stub** with your real sign-in and point `EXPO_PUBLIC_BROKER_URL` at it.
✅ **Checkpoint:** `npm test` in `broker/` is green; the deployed `/healthz` responds.

### Stage 7 — Build & submit → [EAS.md](./EAS.md)
`eas build --profile production` then `eas submit`, under your own developer
accounts. Sandbox→production is an env switch (`EXPO_PUBLIC_ENV` + broker URL) —
no screen code changes.
✅ **Checkpoint:** builds pass and your apps are in App Store Connect / Play Console.

### Stage 8 — After launch
- Keep the SDK current: bump `@beyondplusmm/doehpos-sdk` and re-run `pnpm check`.
- Watch your broker (logs, uptime). Rotate `sk_live_` if ever exposed.
- New verticals (catalog, cart, consumer login) arrive additively — the frame is
  already wired for them.

---

## One-page checklist

- [ ] Sandbox `sk_test_` key with loyalty scope
- [ ] `pnpm install` and the app runs against sandbox
- [ ] `brand.json` edited; `pnpm validate:brand` passes; assets replaced
- [ ] `pnpm smoke:loyalty` green
- [ ] `pnpm check` green (`validate:brand` + `typecheck`)
- [ ] Broker deployed, device-auth stub replaced, `EXPO_PUBLIC_BROKER_URL` set
- [ ] `broker/` `npm test` green
- [ ] No `sk_live_` anywhere in the app or its env
- [ ] Apple + Google accounts ready
- [ ] `eas build --profile production` + `eas submit` done

---

## Where each doc fits

| Doc | When |
|---|---|
| [QUICKSTART.md](./QUICKSTART.md) | Run it locally against sandbox |
| [BRANDING.md](./BRANDING.md) | Make it yours (one file) |
| [PRODUCTION.md](./PRODUCTION.md) | Why/how the secret stays server-side |
| [broker/README.md](../broker/README.md) | Deploy + own the token broker |
| [EAS.md](./EAS.md) | Build and submit to the stores |

## Help

- API & key reference: [developers.doehpos.com](https://developers.doehpos.com)
- SDK: [`@beyondplusmm/doehpos-sdk`](https://www.npmjs.com/package/@beyondplusmm/doehpos-sdk)
- Expo / EAS: [docs.expo.dev](https://docs.expo.dev)
