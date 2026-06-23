/**
 * Feature flags — the mechanism that keeps false assumptions out of the binary
 * (spec §4). A screen whose platform capability does not exist yet ships as a
 * flagged-OFF stub: visibly part of the frame, but it makes no calls to an
 * endpoint that returns nothing. Flip a flag ON only when its platform epic
 * (§12) has shipped AND the SDK exposes the operation.
 */
export interface FeatureFlag {
  enabled: boolean;
  /** Why it is off, and what has to ship first. Shown on the stub screen. */
  requires: string;
}

export const FEATURES = {
  /** Shipped: SDK `loyalty` module (stable, 0.4.0) + /v1/loyalty/*. */
  loyalty: { enabled: true, requires: "" },

  /** Gated: needs the Consumer-Identity platform epic (OTP/email/guest auth). */
  login: {
    enabled: false,
    requires: "Consumer-Identity epic — the platform has no end-user login yet.",
  },

  /** Gated: needs the Catalog-Read platform epic (browse categories/products/search). */
  catalog: {
    enabled: false,
    requires: "Catalog-Read epic — there is no public way to discover SKUs yet.",
  },

  /** Gated: needs Catalog-Read + orders GA (orders is @experimental, not live in prod). */
  cart: {
    enabled: false,
    requires: "Catalog-Read epic + orders GA — cart depends on both.",
  },
} satisfies Record<string, FeatureFlag>;

export type FeatureName = keyof typeof FEATURES;
