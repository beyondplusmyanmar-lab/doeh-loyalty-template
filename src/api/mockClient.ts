import {
  InsufficientPointsError,
  MemberNotFoundError,
  type AccountResponse,
  type PointsInput,
} from "@beyondplusmm/doehpos-sdk";
import type { LoyaltyClient } from "./client";

// In-memory mock of the loyalty API so a developer can build the UI with NO
// sandbox key. Enabled by EXPO_PUBLIC_DOEH_MODE=mock. It throws the SAME error
// classes the SDK does, so the screens' `instanceof` handling is exercised too.
//
// This is a TEMPLATE feature — it does not change the published SDK. Mock state
// is per-process and resets on full reload.

interface LedgerEntry {
  id: string;
  type: "earn" | "redeem";
  points: number;
  reason?: string;
  at: string;
}
interface MockMember {
  balance: number;
  ledger: LedgerEntry[];
}

/** Mock-only admin surface used by the Sandbox Inspector (not part of the SDK). */
export interface MockAdmin {
  /** Wipe all mock members + idempotency cache. */
  reset(): void;
  /** Set a member to a fixed balance with a single "seed" ledger entry. */
  seed(memberId: string, balance: number, reason?: string): void;
}

function makeMock(): { client: LoyaltyClient; admin: MockAdmin } {
  const members = new Map<string, MockMember>();
  const seen = new Map<string, AccountResponse>(); // idempotency replay

  const entry = (type: "earn" | "redeem", points: number, reason?: string): LedgerEntry => ({
    id: Math.random().toString(16).slice(2, 10),
    type,
    points,
    reason,
    at: new Date().toISOString(),
  });

  // Newest-first ledger, matching what the loyalty screen renders.
  const snapshot = (m: MockMember, idempotent = false): AccountResponse =>
    ({ ok: true, idempotent, account: { balance: m.balance, ledger: [...m.ledger].reverse() } }) as AccountResponse;

  const replay = (key: string | undefined): AccountResponse | null =>
    key && seen.has(key) ? { ...(seen.get(key) as AccountResponse), idempotent: true } : null;

  const remember = (key: string | undefined, res: AccountResponse) => {
    if (key) seen.set(key, res);
  };

  const client: LoyaltyClient = {
    loyalty: {
      async getMember(memberId) {
        const m = members.get(memberId);
        if (!m) throw new MemberNotFoundError(404, "EDGE_MEMBER_NOT_FOUND");
        return snapshot(m);
      },

      async earn(memberId, input: PointsInput, opts) {
        const r = replay(opts?.idempotencyKey);
        if (r) return r;
        const m = members.get(memberId) ?? { balance: 0, ledger: [] };
        m.balance += input.points;
        m.ledger.push(entry("earn", input.points, input.reason));
        members.set(memberId, m);
        const res = snapshot(m);
        remember(opts?.idempotencyKey, res);
        return res;
      },

      async redeem(memberId, input: PointsInput, opts) {
        const r = replay(opts?.idempotencyKey);
        if (r) return r;
        const m = members.get(memberId);
        if (!m) throw new MemberNotFoundError(404, "EDGE_MEMBER_NOT_FOUND");
        if (input.points > m.balance) {
          throw new InsufficientPointsError(409, "EDGE_INSUFFICIENT_POINTS", { body: { balance: m.balance } });
        }
        m.balance -= input.points;
        m.ledger.push(entry("redeem", input.points, input.reason));
        const res = snapshot(m);
        remember(opts?.idempotencyKey, res);
        return res;
      },
    },
  };

  const admin: MockAdmin = {
    reset() {
      members.clear();
      seen.clear();
    },
    seed(memberId, balance, reason = "seed") {
      members.set(memberId, { balance, ledger: [entry("earn", balance, reason)] });
    },
  };

  return { client, admin };
}

// Singleton so mock state survives navigation/re-renders within a session.
let singleton: { client: LoyaltyClient; admin: MockAdmin } | null = null;
const ensure = () => (singleton ??= makeMock());

export function getMockClient(): LoyaltyClient {
  return ensure().client;
}

/** Mock-only admin (reset/seed) for the Sandbox Inspector. */
export function getMockAdmin(): MockAdmin {
  return ensure().admin;
}
