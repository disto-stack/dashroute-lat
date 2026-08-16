DROP TRIGGER IF EXISTS set_timestamp_users ON users;
DROP INDEX IF EXISTS idx_users_email;
DROP TABLE IF EXISTS users CASCADE;
