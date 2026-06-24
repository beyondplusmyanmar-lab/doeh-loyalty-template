# ADR — M8: Publishable / Device-Token Key (the `AuthProvider` seam)

- **Status:** Proposed — **design only.** Not scheduled. Implementation is gated on
  a DOEH **platform** capability (a publishable key + edge attestation) that does
  not exist yet. This document defines the *seam* so the template can adopt that
  capability later with **zero app-code change**.
- **Scope:** the `doeh-loyalty-template` (consumer side) only. The cryptographic
  and key-issuance machinery is explicitly **out of scope** (see *Non-goals*).
- **Supersedes nothing.** Complements the v1 token-broker model (M5,
  `docs/PRODUCTION.md`).

---

## 1. Context

v1 ships two ways the app obtains a bearer for the SDK, both funnelled through one
function — `makeClient(bearer, environment)` in `src/api/client.ts`:

| Environment | Bearer the app holds | `baseUrl` | Holds `sk_live_`? |
|-------------|----------------------|-----------|-------------------|
| sandbox     | `sk_test_…` (pasted / prefilled) | sandbox | no |
| production  | **short-lived broker token** (M5) | merchant broker | no — broker does, server-side |
| mock        | n/a (in-memory `mockClient`) | n/a | no |

This already enforces the core invariant: **the app never embeds an `sk_live_`
key.** The broker exists purely to keep the long-lived secret server-side and hand
the device a short-lived token.

M8 is the future where DOEH issues a **publishable key** (`pk_live_…`) that is
*safe to ship in the binary* because it is constrained at the **edge** (scoped,
rate-limited, optionally device-attested). When that exists, the merchant no longer
*needs* to run a broker — the app can talk to the edge directly.

The problem M8 solves on the template side is not "add `pk_live_` support" — it is
**"let the bearer's origin change without touching a single screen."** Today
`makeClient` branches on `environment` and reads `BROKER_URL`. That is fine for two
modes; it does not scale cleanly to three, and it leaks the auth *mechanism* into a
function whose job is to build a client.

## 2. Decision

Introduce a single abstraction — **`AuthProvider`** — that owns "how the app gets a
bearer," and a **`createProvider(env)`** factory that selects one. Every screen
already calls `client.loyalty.*`; with this change the client is built from a
provider, and **app code never changes** when the provider changes.

```ts
// src/auth/provider.ts  (proposed — interface only)
export interface AuthProvider {
  /** Returns a bearer the SDK can use right now. May refresh under the hood. */
  getToken(): Promise<string>;
  /** Where the SDK should send requests for this provider. */
  readonly baseUrl?: string;        // undefined => SDK's built-in environment URL
  readonly environment: Environment;
}
```

### Providers (one per origin of trust)

| Provider | Mode | Bearer | Talks to | Status |
|----------|------|--------|----------|--------|
| `SandboxKeyProvider`     | sandbox    | `sk_test_…` (user-supplied) | sandbox API | **exists** (inline today) |
| `MockAuthProvider`       | mock       | none (in-memory client)     | nothing     | **exists** (`mockClient`) |
| `BrokerAuthProvider`     | production | short-lived broker token    | merchant broker | **exists** (M5, inline today) |
| `PublishableAuthProvider`| production | `pk_live_…` (edge-constrained) | DOEH **edge** | **M8 — future** |

`BrokerAuthProvider` and `PublishableAuthProvider` are **mutually exclusive
production strategies**, chosen by configuration — not a migration that deletes the
broker. Merchants who want to own their auth keep the broker; merchants who want
the simplest path use the publishable key once the platform offers it.

### The factory — the only thing that knows which provider is live

```ts
// src/auth/createProvider.ts  (proposed — shape only)
export function createProvider(env: AppEnv): AuthProvider {
  if (env.mock)                 return new MockAuthProvider();
  if (env.environment === "sandbox")
                                return new SandboxKeyProvider(env.apiKey);
  // production:
  if (env.publishableKey)       return new PublishableAuthProvider(env.publishableKey); // M8
  if (env.brokerUrl)            return new BrokerAuthProvider(env.brokerUrl);            // M5
  throw new Error("production requires a broker URL or a publishable key");
}
```

```ts
// app bootstrap — UNCHANGED across M5 → M8
const auth   = createProvider(env);
const client = makeClient(auth);     // makeClient takes a provider, not a raw bearer
```

`makeClient` becomes a thin adapter: `new DoehClient({ apiKey: await auth.getToken(),
baseUrl: auth.baseUrl, environment: auth.environment, userAgent: USER_AGENT })`.

## 3. Migration path (M5 → M8), zero app-code change

```
v1 (today)                      M8 (future, additive)
─────────────                   ─────────────────────
App                             App
 │ broker token                  │ pk_live_xxx
 ▼                               ▼
Broker  (holds sk_live_)        Edge   (constrains pk_live_)
 │ sk_live_                       │
 ▼                               ▼
DOEH API                        Core
 ▼
Core
```

1. **Platform ships** `pk_live_` + edge enforcement (out of scope here).
2. Template adds `PublishableAuthProvider` + one branch in `createProvider`.
   Existing providers untouched.
3. A merchant migrates by **changing configuration only**: drop
   `EXPO_PUBLIC_BROKER_URL`, set `EXPO_PUBLIC_PUBLISHABLE_KEY`. No screen, no
   `client.loyalty.*` call site, no SDK call changes. They may run the broker and
   publishable builds side by side during cutover.
4. The broker reference implementation (`broker/`) stays shipped and supported —
   it is the fallback and the "own-your-auth" option, **not** deprecated by M8.

## 4. Non-goals (belongs to the DOEH platform, not this template)

The template **consumes** a bearer; it must never **mint or prove** one. The
following are explicitly **out of scope** for M8 in this repo and must live in the
platform / edge:

- ❌ Device attestation (App Attest / Play Integrity)
- ❌ DPoP / proof-of-possession binding
- ❌ JWT issuance, signing, or exchange
- ❌ Refresh-token rotation logic
- ❌ Edge cryptography / key constraint enforcement
- ❌ The `pk_live_` primitive itself (issuance, scoping, revocation)

If implementing M8 in the template ever requires writing any of the above, that is
the signal that platform work is missing — stop and push it down to the platform.

## 5. Consequences

**Positive**
- One seam (`AuthProvider`) instead of `environment`/`BROKER_URL` branching inside
  `makeClient`; adding a strategy is one class + one factory branch.
- App and screens are provably insulated from auth mechanism (they only see
  `client.loyalty.*`).
- M8 becomes a *config flip* for merchants, not a code migration.

**Negative / cost**
- A small indirection (`createProvider` + provider classes) added before the
  capability that justifies it exists. Mitigated: the refactor is mechanical and
  pays off immediately by also cleaning up the current two-mode branching.

**Neutral**
- No behavior change in v1. This ADR introduces **no code**; it is the contract a
  future `feat(auth)` PR would implement.

## 6. Platform prerequisites (tracking)

M8 implementation in the template is unblocked only when the platform provides:

1. A `pk_live_` key class issuable from the developer portal, edge-scoped to the
   loyalty surface.
2. Edge enforcement that makes a shipped `pk_live_` safe (per-key rate limits,
   scope, revocation; optional device attestation).
3. A documented edge base URL for publishable traffic.

Until then: **design only.** Do not implement.

---

*Decision owners: DOEH platform (key + edge) · template maintainer (the seam).
This ADR is the template-side half; the platform half is tracked separately.*
