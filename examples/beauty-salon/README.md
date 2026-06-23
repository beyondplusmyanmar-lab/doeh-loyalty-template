# Beauty Salon example — "Glow Beauty"

A ready-to-brand loyalty app for appointment/service businesses. Demonstrates
**white-labeling only** (name, colours, icon, splash, bundle ids) — no
business-specific logic.

**Target merchants:** salons · spas · nail bars · barbershops.

## Apply (from the repo root)

```bash
cp examples/beauty-salon/brand.json ./brand.json
cp examples/beauty-salon/assets/icon.png examples/beauty-salon/assets/splash.png ./assets/
pnpm doctor
EXPO_PUBLIC_DOEH_MODE=mock pnpm start
```

Then tweak `brand.json` and swap in real `assets/` for your salon. See
[../../docs/BRANDING.md](../../docs/BRANDING.md).
