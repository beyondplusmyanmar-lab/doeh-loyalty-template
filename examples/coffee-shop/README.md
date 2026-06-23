# Coffee Shop example — "Sandbox Coffee"

A ready-to-brand loyalty app for cafés. Demonstrates **white-labeling only**
(name, colours, icon, splash, bundle ids) — no business-specific logic.

**Target merchants:** cafés · bubble-tea shops · small coffee chains.

## Apply (from the repo root)

```bash
cp examples/coffee-shop/brand.json ./brand.json
cp examples/coffee-shop/assets/icon.png examples/coffee-shop/assets/splash.png ./assets/
pnpm doctor
EXPO_PUBLIC_DOEH_MODE=mock pnpm start
```

Then tweak `brand.json` and swap in real `assets/` for your shop. See
[../../docs/BRANDING.md](../../docs/BRANDING.md).
