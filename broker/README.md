# DOEH Loyalty Broker (reference)

A **thin, self-hosted** token broker so a merchant can publish a **real production**
loyalty app without ever putting an `sk_live_` key in the app bundle.

You deploy and own this. DOEH provides it as a reference — it is intentionally
small. See the parent [docs/PRODUCTION.md](../docs/PRODUCTION.md) for the big
picture.

## How it works

```
   App (no key) ──Bearer access token──▶ Broker (holds sk_live_) ──Bearer sk_live_──▶ DOEH API
                ◀── short-lived token ──            (proxies /v1/loyalty/*)
```

1. The app signs the device in at `POST /auth/token` and gets a **short-lived
   access token** (+ a refresh token).
2. The app's SDK is pointed at the broker (`baseUrl`), so every loyalty call
   arrives here with that access token.
3. The broker verifies the token, then forwards the request to DOEH with the real
   `sk_live_` key swapped in. The app never sees the secret.

## Endpoints

| Method & path | Purpose |
|---|---|
| `POST /auth/token` | Device sign-in → `{ accessToken, refreshToken, expiresIn }` |
| `POST /auth/refresh` | `{ refreshToken }` → a fresh `accessToken` |
| `POST /auth/revoke` | `{ refreshToken }` → 204; kills the session's access tokens too |
| `* /v1/loyalty/*` | Authenticated passthrough to DOEH (only this prefix) |
| `GET /healthz` | Liveness |

## Run it

```bash
cp .env.example .env          # fill in DOEH_API_KEY, BROKER_JWT_SECRET, DEVICE_SHARED_SECRET
npm install
npm start                     # node src/index.js
# or:
docker compose up --build
```

Generate strong secrets, e.g. `openssl rand -hex 32` for `BROKER_JWT_SECRET`.

## Test

```bash
npm test
```

Runs against a mock DOEH upstream (no key, no network) and asserts the
security-critical behaviour: token issue/refresh/revoke, rejection of
missing/invalid/revoked tokens, the **key swap** (upstream receives the `sk_`
secret, not the app token), `Idempotency-Key` forwarding, and verbatim status/body
passthrough (so the SDK's typed errors keep working).

## Wiring the app to the broker

In the app, production already routes through the broker via the `baseUrl` seam in
`src/api/client.ts`. The remaining step is obtaining the access token after your
device sign-in:

```ts
// pseudo — call this in your production sign-in flow, then makeClient(accessToken, "production")
const res = await fetch(`${process.env.EXPO_PUBLIC_BROKER_URL}/auth/token`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ deviceId, deviceSecret }), // replace with your real device auth
});
const { accessToken } = await res.json();
```

## Before you go live — read this

- **Replace the device-auth stub.** `POST /auth/token` currently checks a shared
  `DEVICE_SHARED_SECRET`. Swap it in `src/server.js` for real device/user
  authentication (signed device assertion, first-party login, OTP, …). The broker
  ships **no** user store on purpose.
- **Use durable storage.** Sessions/refresh tokens live in-memory (`src/tokens.js`)
  — fine for one instance. For multiple replicas, back them with Redis or a DB.
- **Protect the secret.** `DOEH_API_KEY` is never logged and never sent to the app.
  Keep `.env` out of git (it is gitignored) and out of images.
- **Keep access tokens short** (`ACCESS_TTL_SECONDS`, default 300s).

## Explicitly out of scope

User management · hosted identity · analytics · push notifications · billing ·
social login · device attestation. Those are yours, or arrive with a future DOEH
publishable-key primitive (M8) that makes this broker optional.
