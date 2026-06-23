// `pnpm doctor` — validate the project config before you build or ship.
// Checks brand.json (schema), bundle ids, app assets, eas.json, env, and the
// API-key / broker posture for the selected environment. Exits non-zero on errors
// (warnings don't fail).
import Ajv from "ajv";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const R = (f) => resolve(root, f);

let errors = 0,
  warns = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => {
  console.log(`  ✗ ${m}`);
  errors++;
};
const warn = (m) => {
  console.log(`  ! ${m}`);
  warns++;
};

// Read .env (simple parse) layered under process.env.
function readEnv() {
  const out = { ...process.env };
  if (existsSync(R(".env"))) {
    for (const line of readFileSync(R(".env"), "utf8").split("\n")) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
      if (m && !line.trim().startsWith("#")) out[m[1]] = m[2];
    }
  }
  return out;
}

const env = readEnv();
const ENV = env.EXPO_PUBLIC_ENV === "production" ? "production" : "sandbox";
const MOCK = env.EXPO_PUBLIC_DOEH_MODE === "mock";

console.log("doctor — checking your config\n");

// brand.json (schema-validated)
let brand;
try {
  brand = JSON.parse(readFileSync(R("brand.json"), "utf8"));
  const schema = JSON.parse(readFileSync(R("brand.schema.json"), "utf8"));
  const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);
  if (validate(brand)) {
    ok("brand.json valid");
  } else {
    bad("brand.json invalid:");
    for (const e of validate.errors ?? []) console.log(`      ${e.instancePath || "(root)"}: ${e.message}`);
  }
} catch (e) {
  bad(`brand.json: ${e.message}`);
}

// Bundle ids
if (brand?.ios?.bundleIdentifier) ok(`iOS bundle id: ${brand.ios.bundleIdentifier}`);
if (brand?.android?.package) ok(`Android package: ${brand.android.package}`);
if (brand?.name === "Acme Rewards") warn('brand.name is still "Acme Rewards" — set your own before shipping');

// Assets
for (const a of ["assets/icon.png", "assets/splash.png"]) {
  existsSync(R(a)) ? ok(`asset: ${a}`) : bad(`missing asset: ${a}`);
}

// eas.json
try {
  const eas = JSON.parse(readFileSync(R("eas.json"), "utf8"));
  eas.build?.production ? ok("eas.json has a production profile") : warn("eas.json missing a production profile");
} catch (e) {
  bad(`eas.json: ${e.message}`);
}

// env + mode
existsSync(R(".env")) ? ok(".env present") : warn(".env missing — run `pnpm bootstrap`, or paste the key in-app");
ok(`environment: ${ENV}${MOCK ? " (mock mode)" : ""}`);

// Key / broker posture
const key = env.EXPO_PUBLIC_DOEH_API_KEY || "";
if (MOCK) {
  ok("mock mode — no API key required");
} else if (ENV === "production") {
  key.startsWith("sk_")
    ? bad("an sk_ key is set for production — production must use the broker, never embed a key")
    : ok("no key embedded for production (correct — uses the broker)");
  env.EXPO_PUBLIC_BROKER_URL
    ? ok(`broker url: ${env.EXPO_PUBLIC_BROKER_URL}`)
    : bad("EXPO_PUBLIC_BROKER_URL not set for production");
} else {
  // sandbox
  if (key.startsWith("sk_live_")) bad("sk_live_ must NEVER be embedded — use an sk_test_ key in sandbox");
  else if (key.startsWith("sk_test_")) ok("sandbox key present (sk_test_)");
  else warn("no sandbox key in env — paste an sk_test_ key in Settings, or use mock mode");
}

console.log(`\n${errors ? "✗" : "✓"} ${errors} error(s), ${warns} warning(s)`);
process.exit(errors ? 1 : 0);
