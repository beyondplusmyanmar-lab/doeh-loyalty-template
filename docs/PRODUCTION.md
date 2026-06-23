# Production & publishing

> **The golden rule:** an `sk_live_` key is a **shop-wide secret**. `EXPO_PUBLIC_*`
> values are compiled into the app binary and trivially extractable. Therefore an
> `sk_live_` key **must never** be in this app. Anyone who downloads it would own
> your shop.

This is the difference between the sandbox demo (safe to embed `sk_test_`) and a
real production app.

## The token-broker model (v1)

Until DOEH ships a publishable / device-token key (see *Future* below), production
publishing uses a thin **token broker** that **you** run and own:

```
   ┌──────────┐   device sign-in / attestation   ┌───────────────┐   sk_live_   ┌──────────┐
   │ Your App │ ───────────────────────────────▶ │ Your  Broker  │ ───────────▶ │ DOEH API │
   │ (no key) │ ◀─── short-lived access token ─── │ (holds secret)│              │  → Core  │
   └──────────┘                                   └───────────────┘              └──────────┘
```

- The **app** holds no `sk_live_`. It authenticates the user/device to your broker
  and receives a **short-lived token**.
- The **broker** holds `sk_live_` server-side, validates the token, and proxies
  the request to DOEH.
- **DOEH provides:** this template, the SDK, a sample broker, docs, sandbox, EAS
  guides. **You own:** Apple/Google accounts, broker deployment, your domain, your
  secrets.

### How the app already wires this

`src/api/client.ts` is the single seam. In production it builds the SDK client
with `baseUrl` pointed at your broker, so the bearer it sends is the **broker
token**, not an `sk_live_` key:

```ts
// production branch of makeClient()
new DoehClient({ apiKey: brokerToken, baseUrl: EXPO_PUBLIC_BROKER_URL, userAgent });
```

Set `EXPO_PUBLIC_BROKER_URL` (eas.json `production` profile / `.env`).

### What the reference broker provides (M5 — coming)

Intentionally **minimal**:

- Issue short-lived access tokens
- Hold `sk_live_` server-side
- Token refresh
- Token revocation example
- Dockerfile + deployment examples

Explicitly **out of scope** (yours, or a future platform capability): user
management, billing, social login, push notifications, analytics, device
attestation, hosted identity.

> The reference broker is **not yet shipped** in this scaffold. The seam above is
> in place; the broker service and its sign-in flow land in M5. Until then, this
> template runs in **sandbox** mode.

## Building & submitting (EAS)

```bash
npm i -g eas-cli && eas login
eas build:configure
eas build --profile production --platform ios       # or android / all
eas submit --profile production --platform ios       # or android
```

- `eas.json` defines `development` / `preview` (sandbox) and `production` profiles;
  `EXPO_PUBLIC_ENV` is set per profile.
- Set `EXPO_PUBLIC_BROKER_URL` as an EAS environment variable / secret for the
  production profile.
- Builds publish under **your** Apple Developer and Google Play accounts.

## Future: native publishable keys

When DOEH ships a publishable / device-token primitive, the broker becomes
**optional**: the app obtains a restricted token directly and you swap only the
auth adapter in `src/api/client.ts` — no rewrite. Tracked as M8 in the epic spec.
