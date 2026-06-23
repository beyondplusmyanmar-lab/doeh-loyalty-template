import { DoehClient, type Environment, type AccountResponse, type PointsInput } from "@beyondplusmm/doehpos-sdk";
import { BROKER_URL, USER_AGENT } from "@/config/env";

/**
 * The loyalty surface the app actually uses. The real `DoehClient` satisfies this
 * (it has these methods), and so does the in-memory mock (`mockClient.ts`). The
 * app codes against this interface, so mock mode is a drop-in — no screen changes.
 */
export interface LoyaltyApi {
  earn(memberId: string, input: PointsInput, opts?: { idempotencyKey?: string }): Promise<AccountResponse>;
  redeem(memberId: string, input: PointsInput, opts?: { idempotencyKey?: string }): Promise<AccountResponse>;
  getMember(memberId: string): Promise<AccountResponse>;
}

export interface LoyaltyClient {
  loyalty: LoyaltyApi;
}

/**
 * Build the SDK client. This is the ONLY place the app talks to the network —
 * every screen goes through `client.loyalty.*`, never raw HTTP (spec §4/E1).
 *
 * - sandbox:    bearer is an `sk_test_` key, talking directly to the sandbox API.
 * - production: bearer is a SHORT-LIVED token issued by the merchant's broker,
 *   and `baseUrl` points at that broker — which holds `sk_live_` server-side and
 *   proxies to DOEH. The app therefore never embeds `sk_live_` (spec §3).
 *
 * React Native provides a global fetch, so no fetch injection is needed.
 */
export function makeClient(bearer: string, environment: Environment): DoehClient {
  if (environment === "production") {
    if (!BROKER_URL) {
      // Honest fail-closed: production publishing requires the broker (M5).
      throw new Error(
        "Production requires a token broker (EXPO_PUBLIC_BROKER_URL). " +
          "See docs/PRODUCTION.md. The app must never embed an sk_live_ key.",
      );
    }
    // baseUrl override makes the SDK ignore `environment` and talk to the broker.
    return new DoehClient({ apiKey: bearer, baseUrl: BROKER_URL, userAgent: USER_AGENT });
  }
  return new DoehClient({ apiKey: bearer, environment, userAgent: USER_AGENT });
}
