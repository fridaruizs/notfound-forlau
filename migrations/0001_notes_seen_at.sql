-- Tracks when each user last looked at the notes board (unix seconds).
-- Used by /api/notifications for the admin notification bell.
-- The API also adds this column automatically on first use, so running this is optional.
ALTER TABLE users ADD COLUMN notes_seen_at INTEGER;
