# Maintenance & Diagnostics Scripts

This directory houses project administrative, database migration, and diagnostic utility scripts.

---

## Directory Structure

```text
scripts/
├── admin/            # Administrative actions & database schema maintenance
│   ├── apply_migration.js  # Apply manual SQL patch via Supabase RPC
│   ├── delete_user.mjs     # Delete a user by email from Supabase Auth & member_profiles
│   ├── list_policies.js    # Inspect current Supabase storage / database RLS policies
│   └── make_admin.mjs      # Promote an existing member to the 'admin' role
└── diagnostics/      # Standalone sanity tests & connection diagnostics
    ├── test_anon_upload.js # Test public / anonymous image upload to Supabase Storage
    ├── test_bucket_rls.js  # Test storage bucket RLS permissions
    ├── test_db.ts          # Inspect latest events from database (TypeScript)
    ├── test_db2.js         # Query events and categories
    ├── test_db3.js         # Query Supabase client connection sanity
    ├── test_db_insert.js   # Verify insert privileges on database tables
    ├── test_rls.js         # Verify table RLS read/write rules
    └── test_upload.js      # Verify authenticated file upload flow
```

---

## Running Scripts

All scripts load environment credentials directly from `.env.local` located at the project root. Execute them from the repository root:

### Promote a User to Admin
```bash
node scripts/admin/make_admin.mjs <user-email>
```

### Delete a User
```bash
node scripts/admin/delete_user.mjs <user-email>
```

### Inspect Policies & Schema
```bash
node scripts/admin/list_policies.js
```

### Run Database Diagnostics
```bash
node scripts/diagnostics/test_db2.js
# or with tsx for TypeScript:
npx tsx scripts/diagnostics/test_db.ts
```
