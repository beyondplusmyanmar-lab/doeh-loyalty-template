# Bookstore example — "Margin Notes"

A ready-to-brand loyalty app for general (non-food) retail. Demonstrates
**white-labeling only** (name, colours, icon, splash, bundle ids) — no
business-specific logic.

**Target merchants:** bookstores · gift shops · general retail.

## Apply (from the repo root)

```bash
cp examples/bookstore/brand.json ./brand.json
cp examples/bookstore/assets/icon.png examples/bookstore/assets/splash.png ./assets/
pnpm doctor
EXPO_PUBLIC_DOEH_MODE=mock pnpm start
```

Then tweak `brand.json` and swap in real `assets/` for your store. See
[../../docs/BRANDING.md](../../docs/BRANDING.md).
