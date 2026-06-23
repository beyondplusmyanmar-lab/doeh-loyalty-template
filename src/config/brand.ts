import raw from "../../brand.json";

/**
 * The white-label contract — single source of truth for branding. `brand.json`
 * drives BOTH this in-app identity and the native/store identity (app.config.js).
 *
 * Authoritative validation is the JSON schema (`brand.schema.json`), run in CI /
 * pre-publish via `pnpm validate:brand`. The lightweight checks below are a
 * runtime backstop for the fields the UI actually reads, so a bad config throws
 * at load (failing the build) rather than rendering broken — they intentionally
 * do NOT pull a JSON-schema validator into the app bundle.
 */
export interface Brand {
  name: string;
  slug: string;
  scheme: string;
  tagline: string;
  icon: string;
  splash: string;
  colors: {
    primary: string;
    bg: string;
    card: string;
  };
  ios: {
    bundleIdentifier: string;
    /** Apple Team ID — used by `eas submit`, not the binary. */
    teamId?: string;
  };
  android: {
    package: string;
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
  if (!cond) throw new Error(`brand.json invalid: ${msg} (run \`pnpm validate:brand\` for details)`);
}

// Backstop for the runtime-relevant fields only; the schema validates the rest.
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
