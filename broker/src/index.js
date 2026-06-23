import { createApp } from "./server.js";

function required(key) {
  const v = process.env[key];
  if (!v) {
    console.error(`Missing required env: ${key}`);
    process.exit(1);
  }
  return v;
}

const cfg = {
  // Where to proxy. Defaults to PRODUCTION — point at sandbox for testing.
  apiBase: process.env.DOEH_API_BASE || "https://api.doehpos.com",
  // The secret merchant key. NEVER log this. In production this is sk_live_…
  apiKey: required("DOEH_API_KEY"),
  jwtSecret: required("BROKER_JWT_SECRET"),
  deviceSecret: required("DEVICE_SHARED_SECRET"),
  accessTtl: Number(process.env.ACCESS_TTL_SECONDS || 300), // 5 min
  refreshTtl: Number(process.env.REFRESH_TTL_SECONDS || 2_592_000), // 30 days
  allowedPrefix: process.env.ALLOWED_PATH_PREFIX || "/v1/loyalty",
};

const port = Number(process.env.PORT || 8787);
createApp(cfg).listen(port, () => {
  // Log everything EXCEPT the key.
  console.log(`doeh-loyalty-broker on :${port} → ${cfg.apiBase} (proxying ${cfg.allowedPrefix}*)`);
});
