// One-command setup: `pnpm bootstrap`. Uses only Node built-ins so it runs on a
// fresh clone before dependencies exist, then installs them.
import { existsSync, copyFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const R = (f) => resolve(root, f);
const ok = (m) => console.log(`  ✓ ${m}`);
const warn = (m) => console.log(`  ! ${m}`);

console.log("Bootstrapping DOEH Loyalty Template\n");

// Node version
const major = Number(process.versions.node.split(".")[0]);
major >= 18 ? ok(`Node ${process.versions.node}`) : warn(`Node ${process.versions.node} — Expo needs Node >= 18`);

// .env
if (!existsSync(R(".env"))) {
  copyFileSync(R(".env.example"), R(".env"));
  ok(".env created from .env.example");
} else {
  ok(".env present");
}

// Dependencies
console.log("\nInstalling dependencies (pnpm install)…\n");
try {
  execSync("pnpm install", { cwd: root, stdio: "inherit" });
  ok("Dependencies installed");
} catch {
  warn("pnpm install failed — run it manually");
  process.exit(1);
}

// Expo present
existsSync(R("node_modules/expo")) ? ok("Expo installed") : warn("Expo not found in node_modules");

console.log("\nReady. Next:");
console.log("  pnpm doctor                              # check your config");
console.log("  EXPO_PUBLIC_DOEH_MODE=mock pnpm start    # build the UI with no key");
console.log("  # …or paste an sk_test_ key in Settings, then: pnpm start");
