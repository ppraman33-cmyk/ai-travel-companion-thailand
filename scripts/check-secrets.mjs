import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(process.cwd());
const ignored = new Set([
  ".git",
  ".next",
  "node_modules",
  "playwright-report",
  "test-results",
]);
const textExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".json",
  ".md",
  ".sql",
  ".css",
  ".toml",
  ".yml",
  ".yaml",
  ".example",
  ".sh",
]);
const patterns = [
  /sk-[A-Za-z0-9_-]{20,}/,
  /AIza[0-9A-Za-z_-]{30,}/,
  /gh[pousr]_[A-Za-z0-9]{30,}/,
  /sb_secret_[A-Za-z0-9_-]{20,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /SUPABASE_SERVICE_ROLE_KEY\s*=\s*(?!<|$)[^\s]+/,
];

const findings = [];
function visit(directory) {
  for (const entry of readdirSync(directory)) {
    if (ignored.has(entry)) continue;
    const path = join(directory, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) visit(path);
    else if (
      stat.size <= 2_000_000 &&
      (textExtensions.has(extname(entry)) || entry === ".env.example")
    ) {
      const text = readFileSync(path, "utf8");
      if (patterns.some((pattern) => pattern.test(text)))
        findings.push(relative(root, path));
    }
  }
}

visit(root);
if (findings.length) {
  console.error(`Potential credentials found in: ${findings.join(", ")}`);
  process.exit(1);
}
console.log("Secret-pattern scan passed.");
