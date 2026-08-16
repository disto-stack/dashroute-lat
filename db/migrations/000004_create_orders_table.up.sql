CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(32) PRIMARY KEY,
    customer_id VARCHAR(32) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    courier_id VARCHAR(32) NULL REFERENCES couriers(id) ON DELETE SET NULL,
    status order_status NOT NULL DEFAULT 'PENDING',
    origin_lat NUMERIC(9, 6) NOT NULL,
    origin_lon NUMERIC(9, 6) NOT NULL,
    origin_address TEXT NOT NULL,
    dest_lat NUMERIC(9, 6) NOT NULL,
    dest_lon NUMERIC(9, 6) NOT NULL,
    dest_address TEXT NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'COP',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_courier_id ON orders(courier_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

DROP TRIGGER IF EXISTS set_timestamp_orders ON orders;
CREATE TRIGGER set_timestamp_orders
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
