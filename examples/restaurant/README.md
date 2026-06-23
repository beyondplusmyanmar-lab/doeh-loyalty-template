# Restaurant example — "Harvest Table"

A ready-to-brand loyalty app for larger-ticket, repeat-customer dining.
Demonstrates **white-labeling only** (name, colours, icon, splash, bundle ids) —
no business-specific logic.

**Target merchants:** restaurants · bistros · casual-dining chains.

## Apply (from the repo root)

```bash
cp examples/restaurant/brand.json ./brand.json
cp examples/restaurant/assets/icon.png examples/restaurant/assets/splash.png ./assets/
pnpm doctor
EXPO_PUBLIC_DOEH_MODE=mock pnpm start
```

Then tweak `brand.json` and swap in real `assets/` for your restaurant. See
[../../docs/BRANDING.md](../../docs/BRANDING.md).
