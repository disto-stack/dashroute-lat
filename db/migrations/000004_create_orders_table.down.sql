DROP TRIGGER IF EXISTS set_timestamp_orders ON orders;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_orders_courier_id;
DROP INDEX IF EXISTS idx_orders_customer_id;
DROP TABLE IF EXISTS orders CASCADE;
