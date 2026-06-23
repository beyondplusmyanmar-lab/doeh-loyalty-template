import raw from "../../brand.json";

/**
 * The white-label contract. Editing `brand.json` (and the matching fields in
 * `app.json`) is the entire branding step — a missing/invalid field throws here
 * at load time, which fails the build, not the App Store review (E3).
 *
 * M3 hardens this into a JSON-schema-validated config; v1 validates the fields
 * the UI actually depends on.
 */
export interface Brand {
  name: string;
  tagline: string;
  colors: {
    primary: string;
    bg: string;
    card: string;
  };
  loyalty: {
    /** Display-only, e.g. "Ks", "$". The platform stores points, not currency. */
    currencySymbol: string;
    /**
     * Points awarded per 1 unit of spend. Applied CLIENT-SIDE before calling
     * `loyalty.earn(points)` — the API takes points, not currency.
     */
    pointsPerCurrencyUnit: number;
  };
}

const HEX = /^#[0-9a-fA-F]{6}$/;

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`brand.json invalid: ${msg}`);
}

function validate(b: Brand): Brand {
  assert(typeof b.name === "string" && b.name.trim().length > 0, "name is required");
  assert(typeof b.tagline === "string", "tagline must be a string");
  for (const k of ["primary", "bg", "card"] as const) {
    assert(HEX.test(b.colors?.[k] ?? ""), `colors.${k} must be a #rrggbb hex value`);
  }
  assert(typeof b.loyalty?.currencySymbol === "string", "loyalty.currencySymbol is required");
  assert(
    Number.isFinite(b.loyalty?.pointsPerCurrencyUnit) && b.loyalty.pointsPerCurrencyUnit > 0,
    "loyalty.pointsPerCurrencyUnit must be a positive number",
  );
  return b;
}

export const brand: Brand = validate(raw as Brand);
