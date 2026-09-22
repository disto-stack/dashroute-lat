-- Migration to rename PICKED_UP -> IN_TRANSIT and add ACCEPTED status to order_status enum

CREATE TYPE order_status_new AS ENUM ('PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');

ALTER TABLE orders 
  ALTER COLUMN status TYPE order_status_new 
  USING (
    CASE status::text
      WHEN 'PICKED_UP' THEN 'IN_TRANSIT'
      ELSE status::text
    END
  )::order_status_new;

DROP TYPE order_status;

ALTER TYPE order_status_new RENAME TO order_status;
