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

### The reference broker — shipped in [`broker/`](../broker)

Intentionally **minimal**:

- Issue short-lived access tokens (`POST /auth/token`)
- Hold `sk_live_` server-side and inject it on every proxied call
- Token refresh (`POST /auth/refresh`)
- Token revocation (`POST /auth/revoke`)
- Dockerfile + docker-compose + a self-contained test

Explicitly **out of scope** (yours, or a future platform capability): user
management, billing, social login, push notifications, analytics, device
attestation, hosted identity.

> Run `npm test` in `broker/` to see the security-critical behaviour proven
> against a mock upstream (no key needed): token lifecycle, the key swap, and
> verbatim error passthrough. Full setup + the "before you go live" checklist are
> in [broker/README.md](../broker/README.md).
>
> **Two things you must do before production:** replace the device-auth stub in
> `broker/src/server.js`, and back the in-memory session store with Redis/a DB if
> you run more than one instance.

## Building & submitting (EAS)

The full build-and-publish pipeline — prerequisites, credentials, env vars, build
profiles, store submission, and troubleshooting — is in **[EAS.md](./EAS.md)**.

In short: `eas.json` defines `development` / `preview` (sandbox) and `production`
profiles with `EXPO_PUBLIC_ENV` pinned per profile; set `EXPO_PUBLIC_BROKER_URL`
for the production environment; then `eas build --profile production` and
`eas submit`. Builds publish under **your** Apple Developer and Google Play
accounts.

## Future: native publishable keys

When DOEH ships a publishable / device-token primitive, the broker becomes
**optional**: the app obtains a restricted token directly and you swap only the
auth adapter in `src/api/client.ts` — no rewrite. Tracked as M8 in the epic spec.
