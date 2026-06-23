// Validate brand.json against brand.schema.json. Run in CI / pre-publish and
// any time you rebrand: `pnpm validate:brand`. This is the authoritative
// branding gate (the in-app runtime check in src/config/brand.ts is a backstop).
import Ajv from "ajv";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => JSON.parse(readFileSync(resolve(root, f), "utf8"));

const schema = read("brand.schema.json");
const data = read("brand.json");

const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

if (validate(data)) {
  console.log("✓ brand.json is valid.");
  process.exit(0);
}

console.error("✗ brand.json is invalid:");
for (const e of validate.errors ?? []) {
  console.error(`  ${e.instancePath || "(root)"}: ${e.message}`);
}
process.exit(1);
