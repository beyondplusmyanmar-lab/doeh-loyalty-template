import type { Environment } from "@beyondplusmm/doehpos-sdk";

export const ENVIRONMENTS: Environment[] = ["sandbox", "production"];

/**
 * EXPO_PUBLIC_ENV pins the build's environment (see eas.json). Falls back to
 * sandbox so a fresh clone runs against the safe, disposable sandbox.
 */
const rawEnv = process.env.EXPO_PUBLIC_ENV;
export const BUILD_ENVIRONMENT: Environment =
  rawEnv === "production" ? "production" : "sandbox";

/**
 * Optional dev convenience — prefill the sandbox key so you don't paste it on
 * every reload. SANDBOX ONLY. Never set this to an sk_live_ key: EXPO_PUBLIC_*
 * is inlined into the binary. See docs/PRODUCTION.md.
 */
export const PREFILL_API_KEY = process.env.EXPO_PUBLIC_DOEH_API_KEY ?? "";

/** Production token-broker base URL (M5 — documented, not yet wired). */
export const BROKER_URL = process.env.EXPO_PUBLIC_BROKER_URL ?? "";

export const USER_AGENT = "doeh-loyalty-template/0.1.0";
