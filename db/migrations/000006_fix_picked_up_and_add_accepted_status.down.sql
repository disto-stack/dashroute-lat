-- Revert order_status enum back to original definition ('PENDING', 'ASSIGNED', 'PICKED_UP', 'DELIVERED', 'CANCELLED')

CREATE TYPE order_status_old AS ENUM ('PENDING', 'ASSIGNED', 'PICKED_UP', 'DELIVERED', 'CANCELLED');

ALTER TABLE orders 
  ALTER COLUMN status TYPE order_status_old 
  USING (
    CASE status::text
      WHEN 'ACCEPTED' THEN 'ASSIGNED'
      WHEN 'IN_TRANSIT' THEN 'PICKED_UP'
      ELSE status::text
    END
  )::order_status_old;

DROP TYPE order_status;

ALTER TYPE order_status_old RENAME TO order_status;
