# Bakery example — "Golden Crust"

A ready-to-brand loyalty app for small retail. Demonstrates **white-labeling
only** (name, colours, icon, splash, bundle ids) — no business-specific logic.

**Target merchants:** bakeries · patisseries · dessert counters.

## Apply (from the repo root)

```bash
cp examples/bakery/brand.json ./brand.json
cp examples/bakery/assets/icon.png examples/bakery/assets/splash.png ./assets/
pnpm doctor
EXPO_PUBLIC_DOEH_MODE=mock pnpm start
```

Then tweak `brand.json` and swap in real `assets/` for your shop. See
[../../docs/BRANDING.md](../../docs/BRANDING.md).
