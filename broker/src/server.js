import express from "express";
import { createTokenService } from "./tokens.js";

const BEARER = /^Bearer (.+)$/;
const BODY_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
// Headers forwarded upstream. Authorization is intentionally NOT here — the
// broker REPLACES it with the secret key. Idempotency-Key MUST pass through so
// redeem stays no-double-spend.
const FORWARD_HEADERS = ["content-type", "idempotency-key", "user-agent", "accept"];

/**
 * Build the broker app. The app's SDK is configured with `baseUrl = <broker>`, so
 * every API call arrives here with a short-lived access token; the broker verifies
 * it and forwards the request to DOEH with the real `sk_live_` key injected.
 *
 * cfg: { apiBase, apiKey, jwtSecret, deviceSecret, accessTtl, refreshTtl, allowedPrefix }
 */
export function createApp(cfg) {
  const tokens = createTokenService({
    secret: cfg.jwtSecret,
    accessTtl: cfg.accessTtl,
    refreshTtl: cfg.refreshTtl,
  });

  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());

  app.get("/healthz", (_req, res) => res.json({ ok: true }));

  // ── Device sign-in → tokens ────────────────────────────────────────────────
  // STUB: this checks a shared device secret. REPLACE `deviceSecret` with your
  // real device/user authentication (e.g. verify a signed device assertion, a
  // first-party login, or an OTP). The broker deliberately ships no user store.
  app.post("/auth/token", (req, res) => {
    const { deviceId, deviceSecret } = req.body ?? {};
    if (!deviceId || deviceSecret !== cfg.deviceSecret) {
      return res.status(401).json({ error: "invalid_device" });
    }
    const { accessToken, refreshToken } = tokens.startSession(String(deviceId));
    res.json({ accessToken, refreshToken, tokenType: "Bearer", expiresIn: cfg.accessTtl });
  });

  app.post("/auth/refresh", (req, res) => {
    try {
      const { accessToken } = tokens.refresh(req.body?.refreshToken);
      res.json({ accessToken, tokenType: "Bearer", expiresIn: cfg.accessTtl });
    } catch {
      res.status(401).json({ error: "invalid_refresh" });
    }
  });

  app.post("/auth/revoke", (req, res) => {
    tokens.revoke(req.body?.refreshToken);
    res.status(204).end(); // idempotent: revoking an unknown token still succeeds
  });

  // ── Authenticated proxy to DOEH ────────────────────────────────────────────
  app.use(async (req, res) => {
    if (!req.path.startsWith(cfg.allowedPrefix)) {
      return res.status(404).json({ error: "not_found" });
    }
    const m = BEARER.exec(req.headers.authorization ?? "");
    if (!m) return res.status(401).json({ error: "missing_token" });
    try {
      tokens.verifyAccess(m[1]);
    } catch {
      return res.status(401).json({ error: "invalid_token" });
    }

    const headers = { authorization: `Bearer ${cfg.apiKey}` };
    for (const h of FORWARD_HEADERS) if (req.headers[h]) headers[h] = req.headers[h];
    const hasBody = BODY_METHODS.has(req.method) && req.body && Object.keys(req.body).length > 0;

    try {
      const upstream = await fetch(cfg.apiBase + req.originalUrl, {
        method: req.method,
        headers,
        body: hasBody ? JSON.stringify(req.body) : undefined,
      });
      const text = await upstream.text();
      res.status(upstream.status);
      const ct = upstream.headers.get("content-type");
      if (ct) res.set("content-type", ct);
      // Forward the upstream body verbatim so the SDK's typed errors (e.g.
      // InsufficientPointsError with body.balance) still work end-to-end.
      res.send(text);
    } catch (e) {
      res.status(502).json({ error: "upstream_unreachable", detail: String(e?.message ?? e) });
    }
  });

  return app;
}
