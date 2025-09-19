# Diary Management Scripts

This directory contains utility scripts for managing diary data.

## Delete All Entries Script

The `delete-all-entries.ts` script allows you to delete all diary entries from the Supabase database.

### Usage

#### Method 1: Using npm scripts (Recommended)

```bash
# Soft delete all entries (recoverable)
npm run delete-all-entries

# Permanently delete all entries (cannot be undone)
npm run delete-all-entries:permanent
```

#### Method 2: Direct execution

```bash
# Soft delete all entries (recoverable)
npx ts-node haru-app/scripts/delete-all-entries.ts

# Permanently delete all entries (cannot be undone)
npx ts-node haru-app/scripts/delete-all-entries.ts --permanent
```

### Deletion Types

1. **Soft Delete (Default)**: Sets `is_deleted = true` on all entries
   - Entries are hidden from the UI but remain in the database
   - Can be recovered by manually setting `is_deleted = false` in the database
   - Safer option for testing or accidental deletions

2. **Permanent Delete**: Completely removes entries from the database
   - Entries are permanently deleted and cannot be recovered
   - Use with extreme caution
   - Irreversible action

### Prerequisites

- Node.js and npm installed
- Supabase environment variables configured
- Valid authentication session (you may need to be logged in to the app)

### Safety Features

- The script requires authentication to prevent unauthorized deletions
- Only deletes entries for the currently authenticated user
- Provides a count of deleted entries
- Clear warnings for permanent deletions

### Environment Requirements

Make sure your `.env.local` file contains:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```