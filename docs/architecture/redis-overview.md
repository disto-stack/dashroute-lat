# Redis Keyspace & In-Memory Data Design

## 1. Overview & Conventions

DashRoute utilizes Redis 8.10 as an in-memory compute cache, distributed lock coordinator, and geospatial search index.

### Key Naming Conventions

- All keys follow namespace segmentation using colons: `<namespace>:<entity_type>:<identifier>`.
- Ephemeral locks and heartbeat keys **must** include an explicit TTL.
- Keys are kept compact to minimize memory overhead across millions of daily operations.

---

## 2. Keyspace Catalog

| Key Pattern                      | Redis Type   | TTL        | Purpose                                                                          | Producer                   | Consumer                         |
| :------------------------------- | :----------- | :--------- | :------------------------------------------------------------------------------- | :------------------------- | :------------------------------- |
| `couriers:locations`             | `ZSET` (Geo) | Persistent | Stores real-time latitude/longitude coordinates of all active couriers.          | Geolocation Service        | Dispatch Engine                  |
| `courier:status:<courier_id>`    | `HASH`       | Persistent | Holds operational state flags, vehicle details, and active trip counters.        | Geolocation Service / Auth | Dispatch Engine / Orders Service |
| `courier:heartbeat:<courier_id>` | `STRING`     | 30 seconds | Active WebSocket session keep-alive indicator.                                   | Geolocation Service        | Dispatch Engine / Cron Cleaner   |
| `courier:lock:<courier_id>`      | `STRING`     | 30 seconds | Distributed mutex to prevent double-assignment of a driver to concurrent orders. | Dispatch Engine            | Dispatch Engine                  |
| `idempotency:event:<event_id>`   | `STRING`     | 24 hours   | Prevents duplicate event processing across consumers.                            | Consumer Services          | Consumer Services                |

---

## 3. Data Structures & Command Specifications

### 3.1 Geospatial Index (`couriers:locations`)

- **Type:** Sorted Set (`ZSET`) utilizing 52-bit Geohash encoding.
- **Write Command (Telemetry Ingestion):**

```bash
GEOADD couriers:locations -75.5042 5.0689 "cur_101"
```

- **Read Command (Proximity Dispatching):**

```bash
GEOSEARCH couriers:locations FROMLONLAT -75.5050 5.0695 BYRADIUS 3 km ASC WITHDIST WITHCOORD COUNT 5
```

---

### 3.2 Courier Operational Metadata (`courier:status:<courier_id>`)

- **Type:** Hash (`HASH`).
- **Fields:**
  - `status`: Current operational availability (`ONLINE`, `BUSY`, `OFFLINE`).
  - `vehicle_type`: Transport classification (`MOTORCYCLE`, `BICYCLE`, `CAR`).
  - `active_order_id`: Associated active order ID (or empty string if idle).
  - `last_ping`: Epoch millisecond timestamp of the last recorded telemetry packet.
- **Commands:**

```python
# Update driver state
HSET courier:status:cur_101 status "ONLINE" vehicle_type "MOTORCYCLE" active_order_id "" last_ping "1723800000"

# Query status during dispatch
HGET courier:status:cur_101 status
```

---

### 3.3 Atomic Assignment Mutex (`courier:lock:<courier_id>`)

- **Type:** String (`STRING`).
- **Value:** `order_id` currently attempting lock acquisition.
- **Lock Acquisition (Atomic SET if Not Exists with Expiry):**

```bash
SET courier:lock:cur_101 "ord_987654" NX EX 30
```

- **Lock Release (Safe Cleanup on Successful State Sync):**

```bash
DEL courier:lock:cur_101
```

---

### 3.4 Event Idempotency Tracker (`idempotency:event:<event_id>`)

- **Type:** String (`STRING`).
- **Value:** Processing timestamp / Service name.
- **Command:**

```bash
SET idempotency:event:c4b3a88a-7c91-4d1a-9fa0-67c2d1b82194 "PROCESSED" NX EX 86400
```

- Returns `OK` if the message is new.
- Returns `nil` if the message was already processed within the last 24 hours.
