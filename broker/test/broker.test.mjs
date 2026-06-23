// Self-contained broker test. Spins up the broker pointed at a MOCK DOEH upstream
// (no real key, no network) and proves the security-critical behaviour:
//   - device sign-in issues access + refresh tokens (and rejects a bad secret)
//   - the proxy rejects missing / invalid / revoked tokens
//   - the proxy REPLACES the app's token with the secret key upstream (key swap)
//   - upstream status + body pass through verbatim (so SDK typed errors work)
//   - Idempotency-Key is forwarded
//   - refresh issues a working token; revoke kills access immediately
//
//   npm test    (from broker/)
import http from "node:http";
import { createApp } from "../src/server.js";

let pass = 0,
  fail = 0;
const check = (label, ok, detail = "") => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}${detail ? `  — ${detail}` : ""}`);
  ok ? pass++ : fail++;
};

// ── Mock DOEH upstream ────────────────────────────────────────────────────────
let lastUpstream = null;
const upstream = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    lastUpstream = { method: req.method, url: req.url, auth: req.headers.authorization, idem: req.headers["idempotency-key"], body };
    if (req.url === "/v1/loyalty/members/OVER") {
      res.writeHead(409, { "content-type": "application/json" });
      return res.end(JSON.stringify({ code: "EDGE_INSUFFICIENT_POINTS", balance: 900 }));
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, account: { balance: 1200 } }));
  });
});

const SECRET_KEY = "sk_test_MOCKKEY";
const cfg = {
  apiBase: "", // filled after upstream binds
  apiKey: SECRET_KEY,
  jwtSecret: "test-signing-secret",
  deviceSecret: "device-shared-xyz",
  accessTtl: 300,
  refreshTtl: 3600,
  allowedPrefix: "/v1/loyalty",
};

const listen = (server) => new Promise((r) => server.listen(0, "127.0.0.1", () => r(server.address().port)));

async function main() {
  const upPort = await listen(upstream);
  cfg.apiBase = `http://127.0.0.1:${upPort}`;
  const broker = http.createServer(createApp(cfg));
  const port = await listen(broker);
  const base = `http://127.0.0.1:${port}`;
  const json = (r) => r.json();

  // 1. bad device secret -> 401
  const bad = await fetch(`${base}/auth/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ deviceId: "dev1", deviceSecret: "wrong" }),
  });
  check("sign-in with bad secret -> 401", bad.status === 401, `status=${bad.status}`);

  // 2. good sign-in -> access + refresh
  const tokRes = await fetch(`${base}/auth/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ deviceId: "dev1", deviceSecret: cfg.deviceSecret }),
  });
  const tok = await json(tokRes);
  check("sign-in -> access + refresh tokens", Boolean(tok.accessToken && tok.refreshToken), `expiresIn=${tok.expiresIn}`);

  // 3. proxy without token -> 401
  const noTok = await fetch(`${base}/v1/loyalty/members/A1`);
  check("proxy without token -> 401", noTok.status === 401, `status=${noTok.status}`);

  // 4. proxy with garbage token -> 401
  const badTok = await fetch(`${base}/v1/loyalty/members/A1`, { headers: { authorization: "Bearer not.a.jwt" } });
  check("proxy with invalid token -> 401", badTok.status === 401, `status=${badTok.status}`);

  // 5. proxy with valid token -> 200, AND upstream saw the SECRET key, not the app token
  const ok = await fetch(`${base}/v1/loyalty/members/A1`, { headers: { authorization: `Bearer ${tok.accessToken}` } });
  const okBody = await json(ok);
  check("proxy with valid token -> 200 + body forwarded", ok.status === 200 && okBody.account.balance === 1200, `status=${ok.status}`);
  check("key swap: upstream received sk_ secret, not the app token", lastUpstream?.auth === `Bearer ${SECRET_KEY}`, lastUpstream?.auth);

  // 6. Idempotency-Key forwarded + 409 passthrough verbatim (earn/redeem path)
  const over = await fetch(`${base}/v1/loyalty/members/OVER`, {
    method: "POST",
    headers: { authorization: `Bearer ${tok.accessToken}`, "content-type": "application/json", "idempotency-key": "idem-123" },
    body: JSON.stringify({ points: 5000 }),
  });
  const overBody = await json(over);
  check("upstream 409 passes through verbatim", over.status === 409 && overBody.code === "EDGE_INSUFFICIENT_POINTS" && overBody.balance === 900, `status=${over.status}`);
  check("Idempotency-Key forwarded upstream", lastUpstream?.idem === "idem-123", lastUpstream?.idem);

  // 7. non-allowed path -> 404 (defense in depth)
  const blocked = await fetch(`${base}/v1/orders`, { headers: { authorization: `Bearer ${tok.accessToken}` } });
  check("path outside allowed prefix -> 404", blocked.status === 404, `status=${blocked.status}`);

  // 8. refresh -> new working access token
  const refRes = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken: tok.refreshToken }),
  });
  const ref = await json(refRes);
  const refUse = await fetch(`${base}/v1/loyalty/members/A1`, { headers: { authorization: `Bearer ${ref.accessToken}` } });
  check("refresh -> new access token that works", refRes.status === 200 && refUse.status === 200, `refresh=${refRes.status} use=${refUse.status}`);

  // 9. revoke -> previously-issued access token is rejected immediately
  await fetch(`${base}/auth/revoke`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken: tok.refreshToken }),
  });
  const afterRevoke = await fetch(`${base}/v1/loyalty/members/A1`, { headers: { authorization: `Bearer ${tok.accessToken}` } });
  check("after revoke, access token -> 401", afterRevoke.status === 401, `status=${afterRevoke.status}`);
  const refAfter = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken: tok.refreshToken }),
  });
  check("after revoke, refresh -> 401", refAfter.status === 401, `status=${refAfter.status}`);

  upstream.close();
  broker.close();
  console.log(`\nResult: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error("\nFATAL", e);
  process.exit(1);
});
