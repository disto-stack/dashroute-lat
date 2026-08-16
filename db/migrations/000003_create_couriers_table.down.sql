DROP TRIGGER IF EXISTS set_timestamp_couriers ON couriers;
DROP INDEX IF EXISTS idx_couriers_user_id;
DROP TABLE IF EXISTS couriers CASCADE;
