# Supabase boundary

This folder reserves the infrastructure boundary for future Supabase adapters. Phase 3A defines
connection-setting types only. It intentionally contains no client initialization, database schema,
SQL, migration, table, query, or repository implementation.

Future adapters must implement domain repository interfaces and must not be imported directly by
UI components.
