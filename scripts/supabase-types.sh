#!/usr/bin/env bash
set -euo pipefail

mode="${1:-check}"
target="infrastructure/supabase/types.generated.ts"
temporary_file="$(mktemp -t atct-supabase-types)"
trap 'rm -f "$temporary_file"' EXIT

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI is required." >&2
  exit 1
fi

if [[ -n "${SUPABASE_DB_URL:-}" ]]; then
  if ! SUPABASE_TELEMETRY_DISABLED=1 supabase gen types typescript --db-url "$SUPABASE_DB_URL" > "$temporary_file"; then
    echo "Supabase type generation failed:" >&2
    cat "$temporary_file" >&2
    exit 1
  fi
else
  if ! SUPABASE_TELEMETRY_DISABLED=1 supabase gen types typescript --local > "$temporary_file"; then
    echo "Supabase type generation failed:" >&2
    cat "$temporary_file" >&2
    exit 1
  fi
fi

if [[ "$mode" == "update" ]]; then
  cp "$temporary_file" "$target"
  echo "Updated $target"
  exit 0
fi

if [[ "$mode" != "check" ]]; then
  echo "Usage: $0 [check|update]" >&2
  exit 2
fi

if [[ ! -f "$target" ]]; then
  echo "$target does not exist. Run npm run db:types:generate after supabase db reset." >&2
  exit 1
fi

if ! cmp -s "$temporary_file" "$target"; then
  echo "Generated Supabase types differ from the committed schema snapshot." >&2
  diff -u "$target" "$temporary_file" || true
  exit 1
fi

echo "Generated Supabase types match the local schema."
