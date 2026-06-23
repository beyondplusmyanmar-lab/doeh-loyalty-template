// Live loyalty smoke check for the template. Exercises the SAME flow the app's
// screens drive (lookup → earn-by-amount → read back → redeem → insufficient →
// idempotent replay), through the SAME published SDK the app imports, against the
// real sandbox. This is the M4 "green against sandbox" evidence.
//
//   export DOEH_API_KEY=sk_test_...     # a sandbox key with loyalty scope
//   pnpm smoke:loyalty                  # or: node scripts/loyalty.smoke.mjs
//
// Uses a FRESH random member each run and asserts RELATIVE balance arithmetic, so
// it is deterministic regardless of prior runs and of the brand's points ratio.
// Without a key it no-ops (exit 0) so it is safe to wire into CI.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  DoehClient,
  MemberNotFoundError,
  InsufficientPointsError,
} from "@beyondplusmm/doehpos-sdk";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const brand = JSON.parse(readFileSync(resolve(root, "brand.json"), "utf8"));
const RATIO = brand.loyalty.pointsPerCurrencyUnit;
const SYM = brand.loyalty.currencySymbol;

// The template's earn-by-amount rule, kept in lockstep with app/loyalty.tsx.
const pointsFor = (amount) => Math.floor(amount * RATIO);

const KEY = process.env.DOEH_API_KEY;
const BASE = process.env.DOEH_API_BASE;
let pass = 0,
  fail = 0;
const check = (label, ok, detail = "") => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}${detail ? `  — ${detail}` : ""}`);
  ok ? pass++ : fail++;
};

const opts = BASE ? { baseUrl: BASE } : { environment: "sandbox" };

async function main() {
  console.log(`loyalty smoke → ${BASE ?? "sandbox"}  (ratio ${RATIO} pt/${SYM})`);
  if (!KEY) {
    console.log("  (no DOEH_API_KEY set — skipping live calls)");
    return finish();
  }

  const c = new DoehClient({ apiKey: KEY, userAgent: "doeh-loyalty-template-smoke/0.1.0", ...opts });
  const member = "TMPL_SMOKE_" + Math.random().toString(16).slice(2, 10);
  console.log(`  member = ${member}`);

  // 0. lookup a never-seen member -> 404 (the screen renders "earn to create").
  try {
    await c.loyalty.getMember(member);
    check("fresh lookup -> 404", false, "no error thrown");
  } catch (e) {
    check("fresh lookup -> MemberNotFoundError", e instanceof MemberNotFoundError, e?.code ?? `${e}`);
  }

  // 1. earn by purchase amount -> auto-provisions; balance == pointsFor(amount).
  const buy1 = 1000;
  const p1 = pointsFor(buy1);
  const e1 = await c.loyalty.earn(member, { points: p1, reason: "in-store purchase" });
  check(`earn ${SYM}${buy1} (=${p1} pts) -> balance ${p1}`, e1.ok === true && e1.account.balance === p1, `balance=${e1.account.balance}`);

  // 2. earn again -> balance accumulates.
  const buy2 = 250;
  const p2 = pointsFor(buy2);
  const e2 = await c.loyalty.earn(member, { points: p2, reason: "purchase" });
  check(`earn ${SYM}${buy2} (=${p2} pts) -> balance ${p1 + p2}`, e2.account.balance === p1 + p2, `balance=${e2.account.balance}`);

  // 3. read back (the "Look up balance" button).
  const r = await c.loyalty.getMember(member);
  check(`getMember -> balance ${p1 + p2}`, r.account.balance === p1 + p2, `balance=${r.account.balance}`);

  // 4. redeem some points.
  const red = Math.max(1, Math.floor((p1 + p2) / 3));
  const rd = await c.loyalty.redeem(member, { points: red, reason: "reward" });
  const afterRedeem = p1 + p2 - red;
  check(`redeem ${red} -> balance ${afterRedeem}`, rd.account.balance === afterRedeem, `balance=${rd.account.balance}`);

  // 5. redeem over balance -> 409, no deduction (the screen's negative path).
  try {
    await c.loyalty.redeem(member, { points: afterRedeem + 1_000_000 });
    check("redeem over balance -> 409", false, "no error thrown");
  } catch (e) {
    const ok = e instanceof InsufficientPointsError && e.body?.balance === afterRedeem;
    check("redeem over balance -> InsufficientPointsError (balance unchanged)", ok, `code=${e?.code} balance=${e?.body?.balance}`);
  }
  const after = await c.loyalty.getMember(member);
  check(`balance still ${afterRedeem} after rejected redeem`, after.account.balance === afterRedeem, `balance=${after.account.balance}`);

  // 6. redeem idempotency — same key twice deducts once.
  const idem = "tmpl-smoke-" + Math.random().toString(16).slice(2, 10);
  const i1 = await c.loyalty.redeem(member, { points: 1 }, { idempotencyKey: idem });
  const i2 = await c.loyalty.redeem(member, { points: 1 }, { idempotencyKey: idem });
  check(
    "redeem idempotency: same key deducts once (replay flagged)",
    i1.account.balance === afterRedeem - 1 && i2.account.balance === afterRedeem - 1 && i2.idempotent === true,
    `b1=${i1.account.balance} b2=${i2.account.balance} idem=${i2.idempotent}`,
  );

  return finish();
}

function finish() {
  console.log(`\nResult: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error("\nFATAL", e);
  process.exit(1);
});
