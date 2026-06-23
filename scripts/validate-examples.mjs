// Validate every examples/<brand>/brand.json against brand.schema.json, so the
// example packs can never drift from the real contract — a copied example always
// passes `pnpm doctor`. Run: `pnpm validate:examples`.
import Ajv from "ajv";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const examplesDir = resolve(root, "examples");
const schema = JSON.parse(readFileSync(resolve(root, "brand.schema.json"), "utf8"));
const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);

let fail = 0,
  count = 0;

for (const name of readdirSync(examplesDir).sort()) {
  const dir = join(examplesDir, name);
  if (!statSync(dir).isDirectory()) continue;
  const bj = join(dir, "brand.json");
  if (!existsSync(bj)) continue;
  count++;
  const data = JSON.parse(readFileSync(bj, "utf8"));
  if (validate(data)) {
    // Also confirm the referenced assets exist, so copy-and-run actually works.
    const missing = ["icon", "splash"].filter((k) => !existsSync(resolve(dir, data[k])));
    if (missing.length) {
      console.log(`  ✗ ${name}: missing asset(s) ${missing.join(", ")}`);
      fail++;
    } else {
      console.log(`  ✓ ${name}`);
    }
  } else {
    console.log(`  ✗ ${name}:`);
    for (const e of validate.errors ?? []) console.log(`      ${e.instancePath || "(root)"}: ${e.message}`);
    fail++;
  }
}

console.log(`\n${fail ? "✗" : "✓"} ${count - fail}/${count} examples valid`);
process.exit(fail ? 1 : 0);
