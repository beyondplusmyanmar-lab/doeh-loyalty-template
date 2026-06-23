import jwt from "jsonwebtoken";
import { randomBytes, randomUUID } from "node:crypto";

/**
 * Minimal session + token service for the reference broker.
 *
 * A "session" is started after a successful device sign-in. It mints a signed,
 * short-lived **access token** (the bearer the app sends on every request) and a
 * long-lived opaque **refresh token**. Access tokens carry the session id (`sid`);
 * revoking a session immediately invalidates BOTH its refresh token and any
 * outstanding access tokens (the `sid` is checked on every verify).
 *
 * Storage here is IN-MEMORY — fine for a single instance and easy to read. For
 * production / multiple replicas, back `refreshStore` and `activeSessions` with
 * Redis or a database (the surface is tiny: get/set/delete + a membership check).
 */
export function createTokenService({ secret, accessTtl, refreshTtl }) {
  /** refreshToken -> { sid, deviceId, exp(ms) } */
  const refreshStore = new Map();
  /** active session ids */
  const activeSessions = new Set();

  function issueAccess(sid, deviceId) {
    return jwt.sign({ sid }, secret, { subject: deviceId, expiresIn: accessTtl });
  }

  function startSession(deviceId) {
    const sid = randomUUID();
    const refreshToken = randomBytes(32).toString("hex");
    refreshStore.set(refreshToken, { sid, deviceId, exp: Date.now() + refreshTtl * 1000 });
    activeSessions.add(sid);
    return { sid, refreshToken, accessToken: issueAccess(sid, deviceId) };
  }

  /** Verify an access token; throws if invalid, expired, or its session is revoked. */
  function verifyAccess(token) {
    const payload = jwt.verify(token, secret);
    if (!activeSessions.has(payload.sid)) throw new Error("session_revoked");
    return payload;
  }

  /** Exchange a refresh token for a fresh access token. */
  function refresh(refreshToken) {
    const s = refreshStore.get(refreshToken);
    if (!s || !activeSessions.has(s.sid)) throw new Error("invalid_refresh");
    if (Date.now() > s.exp) {
      revoke(refreshToken);
      throw new Error("refresh_expired");
    }
    return { accessToken: issueAccess(s.sid, s.deviceId) };
  }

  /** Revoke a session by its refresh token (kills its access tokens too). */
  function revoke(refreshToken) {
    const s = refreshStore.get(refreshToken);
    if (s) {
      activeSessions.delete(s.sid);
      refreshStore.delete(refreshToken);
    }
  }

  return { startSession, issueAccess, verifyAccess, refresh, revoke };
}
