CREATE TABLE IF NOT EXISTS couriers (
    id VARCHAR(32) PRIMARY KEY,
    user_id VARCHAR(32) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type vehicle_type NOT NULL DEFAULT 'MOTORCYCLE',
    plate_number VARCHAR(20) NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_couriers_user_id ON couriers(user_id);

DROP TRIGGER IF EXISTS set_timestamp_couriers ON couriers;
CREATE TRIGGER set_timestamp_couriers
BEFORE UPDATE ON couriers
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
