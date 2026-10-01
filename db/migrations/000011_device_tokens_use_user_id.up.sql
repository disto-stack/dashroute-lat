ALTER TABLE device_tokens DROP CONSTRAINT IF EXISTS device_tokens_driver_id_fkey;
ALTER TABLE device_tokens DROP CONSTRAINT IF EXISTS device_tokens_driver_id_key;
DROP INDEX IF EXISTS idx_device_tokens_driver_id;

ALTER TABLE device_tokens RENAME COLUMN driver_id TO user_id;

ALTER TABLE device_tokens ADD CONSTRAINT device_tokens_user_id_key UNIQUE (user_id);
ALTER TABLE device_tokens ADD CONSTRAINT device_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
