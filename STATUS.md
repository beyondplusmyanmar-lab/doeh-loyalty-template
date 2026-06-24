# Project Status

## DOEH Loyalty Starter — v1.2.1

```
STATUS: FROZEN

Accepted changes:
  - Bug fixes
  - SDK parity (track doehpos-sdk releases)
  - Documentation
  - Expo / React Native upgrades
  - Examples (branding-only)

Deferred:
  - M8 publishable key   (platform-gated — design only, see docs/M8-ADR.md)
  - Device walkthrough   (human validation on device/simulator)
  - Live sandbox smoke   (operator: pnpm smoke:sandbox with a real key)

Rejected (out of scope — belongs to DOEH platform / first-party apps):
  - Merchant backoffice capabilities
  - Analytics
  - Coupon CMS
  - Loyalty administration / dashboards
  - Tier CRUD / campaign builders
  - Wallet admin
```

## Why frozen

The template is a **complete, store-publishable** loyalty starter. Further value
comes from **platform capabilities that unlock multiple products**, not from
expanding an already-complete starter kit. Engineering effort is therefore directed
at the platform; the template only **consumes** what the platform ships.

## What "frozen" means in practice

- **PRs that fit "Accepted changes" above are welcome** and reviewed normally.
- **Feature PRs that add merchant administration surfaces are declined** — those
  are first-party / platform concerns, not a clone-and-own starter's job.
- The freeze is **not** end-of-life: SDK parity and toolchain upgrades keep it
  current and shippable indefinitely.

## Open items (none are template engineering)

| Item | Type | Owner | Where |
|------|------|-------|-------|
| M8 publishable key | future, platform-gated | DOEH platform + maintainer | design in [`docs/M8-ADR.md`](./docs/M8-ADR.md) |
| Live sandbox smoke | operator run | operator | `pnpm smoke:sandbox` (needs a real `sk_test_` key) |
| Device walkthrough | human validation | you | [`docs/SUBMISSION.md`](./docs/SUBMISSION.md), [`docs/EAS.md`](./docs/EAS.md) |
