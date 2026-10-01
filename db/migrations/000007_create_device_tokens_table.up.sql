CREATE TABLE device_tokens (
    id VARCHAR(32) PRIMARY KEY,
    driver_id VARCHAR(32) UNIQUE NOT NULL REFERENCES couriers(id) ON DELETE CASCADE,
    expo_push_token VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_device_tokens_driver_id ON device_tokens(driver_id);
