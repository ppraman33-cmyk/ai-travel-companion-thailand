import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const directory = resolve(process.cwd(), "supabase/migrations");
const migrations = readdirSync(directory)
  .filter((file) => file.endsWith(".sql"))
  .sort();

const supabaseConfig = readFileSync(
  resolve(process.cwd(), "supabase/config.toml"),
  "utf8",
);
if (supabaseConfig.includes("nationwide-draft-seed.sql")) {
  throw new Error(
    "Quarantined nationwide seed must not be in the automatic seed pipeline.",
  );
}

if (
  migrations.length === 0 ||
  new Set(migrations.map((file) => file.slice(0, 12))).size !== migrations.length
) {
  throw new Error("Migration identifiers must be present, ordered, and unique.");
}

const digest = createHash("sha256");
for (const file of migrations) {
  const sql = readFileSync(resolve(directory, file), "utf8");
  if (!sql.trim()) throw new Error(`Empty migration: ${file}`);
  if (/service_role|supabase_service_role_key|execute\s+format\s*\(/i.test(sql)) {
    throw new Error(`Unsafe migration content detected: ${file}`);
  }
  digest.update(file);
  digest.update("\0");
  digest.update(sql);
  digest.update("\0");
}

const digestValue = digest.digest("hex");
const snapshot = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "infrastructure/supabase/schema-contract.json"),
    "utf8",
  ),
);
if (snapshot.migrationCount !== migrations.length || snapshot.sha256 !== digestValue) {
  throw new Error(
    "Migration schema drift detected. Review migrations and intentionally update schema-contract.json.",
  );
}

const contract = readFileSync(
  resolve(process.cwd(), "infrastructure/supabase/types.ts"),
  "utf8",
);
for (const required of ["PlaceRow", "TripRow", "EmergencyProfileRow", "Database"]) {
  if (!contract.includes(required))
    throw new Error(`Manual boundary is missing ${required}.`);
}

console.log(
  `Schema contract OK: ${migrations.length} migrations, sha256:${digestValue}`,
);
