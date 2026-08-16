# Data Model & Relational Schema (PostgreSQL 18)

## 1. Domain Summary & Relationships

| Relationship | Cardinality | Constraint / Action | Architectural Purpose |
| :--- | :---: | :--- | :--- |
| **`users` &rarr; `couriers`** | 1 : 1 | `ON DELETE CASCADE` (`user_id` UNIQUE) | Extends user credentials with vehicle & KYC attributes. |
| **`users` &rarr; `orders`** | 1 : N | `ON DELETE RESTRICT` | Connects customer account to requested deliveries. |
| **`couriers` &rarr; `orders`** | 1 : N | `ON DELETE SET NULL` (Nullable) | Tracks assigned driver; populated by Dispatch Engine. |
| **`orders` &rarr; `audit_logs`** | 1 : N | `ON DELETE SET NULL` (Nullable) | Forensic event trail capturing lifecycle transitions. |

---

## 2. Enumerations (Enums)

* **`user_role`**: `CUSTOMER`, `COURIER`, `DISPATCHER`, `ADMIN`
* **`vehicle_type`**: `BICYCLE`, `MOTORCYCLE`, `CAR`, `VAN`
* **`order_status`**: `PENDING` &rarr; `ASSIGNED` &rarr; `PICKED_UP` &rarr; `DELIVERED` (or `CANCELLED`)

---

## 3. Data Dictionary

### Table: `users`

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(32)` | **PRIMARY KEY** | Prefixed identifier (`usr_...`). |
| `email` | `VARCHAR(255)` | `UNIQUE NOT NULL` | Login email address. |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Argon2id/bcrypt credential hash. |
| `full_name` | `VARCHAR(150)` | `NOT NULL` | Legal user name. |
| `role` | `user_role` | `NOT NULL DEFAULT 'CUSTOMER'` | RBAC authorization level. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Last update timestamp. |

### Table: `couriers`

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(32)` | **PRIMARY KEY** | Prefixed identifier (`cur_...`). |
| `user_id` | `VARCHAR(32)` | `UNIQUE NOT NULL REFERENCES users(id)` | 1:1 binding to base account. |
| `vehicle_type` | `vehicle_type` | `NOT NULL DEFAULT 'MOTORCYCLE'` | Vehicle classification. |
| `plate_number` | `VARCHAR(20)` | `NULL` | License plate (nullable for bikes). |
| `is_verified` | `BOOLEAN` | `NOT NULL DEFAULT FALSE` | KYC verification state. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Registration timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Last update timestamp. |

### Table: `orders`

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(32)` | **PRIMARY KEY** | Prefixed identifier (`ord_...`). |
| `customer_id` | `VARCHAR(32)` | `NOT NULL REFERENCES users(id)` | FK to requesting customer. |
| `courier_id` | `VARCHAR(32)` | `NULL REFERENCES couriers(id)` | FK to assigned driver. |
| `status` | `order_status` | `NOT NULL DEFAULT 'PENDING'` | Lifecycle state. |
| `origin_lat`, `origin_lon` | `NUMERIC(9,6)` | `NOT NULL` | Pickup GPS coordinates. |
| `origin_address` | `TEXT` | `NOT NULL` | Human-readable pickup address. |
| `dest_lat`, `dest_lon` | `NUMERIC(9,6)` | `NOT NULL` | Drop-off GPS coordinates. |
| `dest_address` | `TEXT` | `NOT NULL` | Human-readable drop-off address. |
| `total_amount` | `NUMERIC(12,2)` | `NOT NULL` | Delivery fare. |
| `currency` | `VARCHAR(3)` | `NOT NULL DEFAULT 'COP'` | Currency code (ISO 4217). |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Order intake timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Last status transition timestamp. |

### Table: `audit_logs`

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | **PRIMARY KEY** | Auto-incrementing identifier. |
| `event_id` | `UUID` | `UNIQUE NOT NULL` | Envelope event UUID (deduplication). |
| `order_id` | `VARCHAR(32)` | `NULL REFERENCES orders(id)` | Correlated order ID. |
| `event_type` | `VARCHAR(100)` | `NOT NULL` | AMQP routing key/event name. |
| `producer` | `VARCHAR(50)` | `NOT NULL` | Origin microservice. |
| `payload` | `JSONB` | `NOT NULL` | Complete raw JSON payload. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Storage timestamp. |

---

## 4. Indexing Strategy

| Table | Index Name | Target Columns | Method | Performance Justification |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `idx_users_email` | `email` | B-Tree | Sub-millisecond credential lookup during login. |
| `couriers` | `idx_couriers_user_id` | `user_id` | B-Tree | Instant 1:1 join resolution with user credentials. |
| `orders` | `idx_orders_customer_id` | `customer_id` | B-Tree | Prevents sequential scans on customer history queries. |
| `orders` | `idx_orders_courier_id` | `courier_id` | B-Tree | Accelerates active courier shift aggregations. |
| `orders` | `idx_orders_status` | `status` | B-Tree | Optimizes backoffice filtering on active orders. |
| `audit_logs` | `idx_audit_logs_event_id` | `event_id` | B-Tree (Unique) | Enforces strict idempotent event insertion. |

---

## 5. Schema Evolution & Migration Strategy

* **Executable Migrations:** Stored as sequential, paired `.up.sql` / `.down.sql` files in `db/migrations/` and executed via `golang-migrate`.
* **Visual Entity-Relationship Model:** Declared in [db/schema.dbml](file:///home/disto/personal-projects/dashroute/db/schema.dbml) for interactive rendering on [dbdiagram.io](https://dbdiagram.io).
* **Architecture Decision Record:** See [ADR 0006: Database Migration & Schema Evolution Strategy](file:///home/disto/personal-projects/dashroute/docs/adr/0006-database-migration-and-schema-evolution-strategy.md).
