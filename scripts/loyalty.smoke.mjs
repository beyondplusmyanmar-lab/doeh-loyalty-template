// DOEH Sandbox Smoke — the one-command operator check for the Loyalty Starter.
//
//   export DOEH_API_KEY=sk_test_...     # a sandbox key with loyalty scope
//   pnpm smoke:sandbox                  # (alias: pnpm smoke:loyalty)
//
// Exercises the SAME flow the app's screens drive (key → reachability → member →
// earn → balance → redeem → over-redeem 409 → idempotent replay), through the SAME
// published SDK the app imports, against the real sandbox. This is the M4
// "green against sandbox" evidence.
//
// A FRESH random member each run and RELATIVE balance arithmetic keep it
// deterministic regardless of prior runs and of the brand's points ratio.
// Without a key it prints a friendly SKIP and exits 0, so it stays CI-safe.
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
const TARGET = BASE ?? "sandbox";

let pass = 0,
  fail = 0;
const ok = (label) => {
  console.log(`  \x1b[32m✓\x1b[0m ${label}`);
  pass++;
};
const bad = (label, detail = "") => {
  console.log(`  \x1b[31m✗\x1b[0m ${label}${detail ? `  — ${detail}` : ""}`);
  fail++;
};
const check = (label, cond, detail = "") => (cond ? ok(label) : bad(label, detail));

const opts = BASE ? { baseUrl: BASE } : { environment: "sandbox" };

console.log("\nDOEH Sandbox Smoke");
console.log(`  brand: ${brand.name}  ·  ratio ${RATIO} pt/${SYM}  ·  target ${TARGET}\n`);

async function main() {
  // 1. key present — friendly SKIP (exit 0) so this stays safe in CI.
  if (!KEY) {
    bad("key present");
    console.log("\n  No sandbox key found. Export one and re-run:\n");
    console.log("    export DOEH_API_KEY=sk_test_xxx");
    console.log("    pnpm smoke:sandbox\n");
    console.log("  Mint a sandbox loyalty key from the DOEH developer portal.\n");
    console.log("SKIP");
    process.exit(0);
  }
  ok("key present");

  const c = new DoehClient({ apiKey: KEY, userAgent: "doeh-loyalty-template-smoke/0.1.0", ...opts });
  const member = "TMPL_SMOKE_" + Math.random().toString(16).slice(2, 10);

  // 2. sandbox reachable + 3. fresh member -> 404 (a structured 404 IS proof we
  //    reached the API and it answered; a transport error is the reachability fail).
  try {
    await c.loyalty.getMember(member);
    ok("sandbox reachable");
    bad("fresh member is unknown (404)", "member already existed");
  } catch (e) {
    if (e instanceof MemberNotFoundError) {
      ok("sandbox reachable");
      ok(`fresh member is unknown (404)  [${member}]`);
    } else {
      ok; // not reached
      bad("sandbox reachable", e?.message ?? `${e}`);
      console.log("\n  Could not reach the sandbox API. Check the key and network.\n");
      return finish();
    }
  }

  // 4. earn by purchase amount -> auto-provisions; balance == pointsFor(amount).
  const buy1 = 1000;
  const p1 = pointsFor(buy1);
  const e1 = await c.loyalty.earn(member, { points: p1, reason: "in-store purchase" });
  check(`earn ${SYM}${buy1} → ${p1} pts`, e1.ok === true && e1.account.balance === p1, `balance=${e1.account.balance}`);

  // 5. earn again -> balance accumulates.
  const buy2 = 250;
  const p2 = pointsFor(buy2);
  const e2 = await c.loyalty.earn(member, { points: p2, reason: "purchase" });
  check(`earn ${SYM}${buy2} → ${p1 + p2} pts (accumulates)`, e2.account.balance === p1 + p2, `balance=${e2.account.balance}`);

  // 6. read back (the "Look up balance" button).
  const r = await c.loyalty.getMember(member);
  check(`balance reads ${p1 + p2}`, r.account.balance === p1 + p2, `balance=${r.account.balance}`);

  // 7. redeem some points.
  const red = Math.max(1, Math.floor((p1 + p2) / 3));
  const afterRedeem = p1 + p2 - red;
  const rd = await c.loyalty.redeem(member, { points: red, reason: "reward" });
  check(`redeem ${red} → ${afterRedeem}`, rd.account.balance === afterRedeem, `balance=${rd.account.balance}`);

  // 8. redeem over balance -> 409, no deduction (the screen's negative path).
  try {
    await c.loyalty.redeem(member, { points: afterRedeem + 1_000_000 });
    bad("over-redeem rejected (409)", "no error thrown");
  } catch (e) {
    const good = e instanceof InsufficientPointsError && e.body?.balance === afterRedeem;
    check("over-redeem rejected (409, balance unchanged)", good, `code=${e?.code} balance=${e?.body?.balance}`);
  }
  const after = await c.loyalty.getMember(member);
  check(`balance still ${afterRedeem} after rejected redeem`, after.account.balance === afterRedeem, `balance=${after.account.balance}`);

  // 9. redeem idempotency — same key twice deducts once.
  const idem = "tmpl-smoke-" + Math.random().toString(16).slice(2, 10);
  const i1 = await c.loyalty.redeem(member, { points: 1 }, { idempotencyKey: idem });
  const i2 = await c.loyalty.redeem(member, { points: 1 }, { idempotencyKey: idem });
  check(
    "idempotent redeem deducts once (replay flagged)",
    i1.account.balance === afterRedeem - 1 && i2.account.balance === afterRedeem - 1 && i2.idempotent === true,
    `b1=${i1.account.balance} b2=${i2.account.balance} idem=${i2.idempotent}`,
  );

  return finish();
}

function finish() {
  const total = pass + fail;
  if (fail) {
    console.log(`\n\x1b[31mFAIL\x1b[0m  (${pass}/${total})\n`);
    process.exit(1);
  }
  console.log(`\n\x1b[32mPASS\x1b[0m  (${pass}/${total})\n`);
  process.exit(0);
}

main().catch((e) => {
  console.error("\nFATAL", e);
  process.exit(1);
});
