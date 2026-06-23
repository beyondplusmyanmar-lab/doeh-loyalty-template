# Example brands

Ready-to-copy branding packs that show what the template looks like as different
businesses. Each is **branding only** — `brand.json` + colored `icon.png` /
`splash.png` placeholders. There is **no business-specific logic** (no "buy 10
get 1", memberships, coupons, inventory, etc.); those belong in your own app, not
the starter.

| Example | Target merchant |
|---|---|
| [coffee-shop](./coffee-shop) — *Sandbox Coffee* | cafés, bubble-tea, small coffee chains |
| [beauty-salon](./beauty-salon) — *Glow Beauty* | salons, spas, nail bars, barbershops |
| [bakery](./bakery) — *Golden Crust* | bakeries, patisseries, dessert counters |
| [restaurant](./restaurant) — *Harvest Table* | restaurants, bistros, casual dining |
| [bookstore](./bookstore) — *Margin Notes* | bookstores, gift shops, general retail |

## Use one (≈5 minutes)

From the repo root:

```bash
cp examples/coffee-shop/brand.json ./brand.json
cp examples/coffee-shop/assets/icon.png examples/coffee-shop/assets/splash.png ./assets/
pnpm doctor                                # validates the swapped config
EXPO_PUBLIC_DOEH_MODE=mock pnpm start      # runs with no key
```

Swap `coffee-shop` for any folder above. Then make it truly yours by editing
`brand.json` and dropping in real assets — see
[docs/BRANDING.md](../docs/BRANDING.md).

## Staying in sync

Every example's `brand.json` conforms to the same
[`brand.schema.json`](../brand.schema.json) the app uses, enforced by:

```bash
pnpm validate:examples
```

So a copied example always passes `pnpm doctor`. Each example's `brand.json` uses
`"$schema": "./brand.schema.json"`, which resolves once copied to the repo root.
