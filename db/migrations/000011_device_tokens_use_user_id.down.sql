ALTER TABLE device_tokens DROP CONSTRAINT IF EXISTS device_tokens_user_id_fkey;
ALTER TABLE device_tokens DROP CONSTRAINT IF EXISTS device_tokens_user_id_key;
DROP INDEX IF EXISTS idx_device_tokens_user_id;

ALTER TABLE device_tokens RENAME COLUMN user_id TO driver_id;

ALTER TABLE device_tokens ADD CONSTRAINT device_tokens_driver_id_key UNIQUE (driver_id);
ALTER TABLE device_tokens ADD CONSTRAINT device_tokens_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES couriers(id) ON DELETE CASCADE;

CREATE INDEX idx_device_tokens_driver_id ON device_tokens(driver_id);
