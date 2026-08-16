# ADR 0003: In-Memory Geospatial Dispatching and Atomic Courier Locking

## Status

Accepted

## Context

When multiple orders are placed simultaneously within the same geographic perimeter, concurrent worker instances of the Dispatch Engine may target the same nearest available courier.

Resolving candidate availability and locking couriers directly in PostgreSQL using row-level locks (`SELECT ... FOR UPDATE`) creates high transaction contention and database thread serialization under peak loads.

## Decision

Execute proximity matching and atomic concurrency locking entirely within **Redis**:

1. **Candidate Discovery:** The Go `Dispatch Engine` executes `GEOSEARCH couriers:locations BYRADIUS 3km ASC COUNT 5` to identify candidate couriers sorted by proximity.
2. **Status Validation:** Confirms the candidate's runtime status via `HGET courier:status:<id>` (`ONLINE` and `IDLE`).
3. **Atomic Mutual Exclusion (Mutex):** Acquires an atomic lock using:

   ```text
   SET courier:lock:<courier_id> "BUSY" NX EX 30
