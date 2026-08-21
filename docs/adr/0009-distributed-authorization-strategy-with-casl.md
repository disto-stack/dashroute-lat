# ADR 0009: Distributed Authorization Strategy with CASL

## Status

Accepted

## Context

With the adoption of stateless JSON Web Tokens (JWT) for authentication (as defined in ADR 0008), the system can quickly and securely verify a user's identity (`sub`) and baseline role (`role` e.g., `CUSTOMER`, `COURIER`) across all microservices without centralized database lookups.

However, basic Role-Based Access Control (RBAC) via NestJS Guards (e.g., `@Roles('CUSTOMER')`) is insufficient for fine-grained authorization rules. For instance, in the `orders-service`, a `CUSTOMER` should only be able to read or cancel their _own_ orders, and a `COURIER` should only be able to update orders explicitly assigned to them.

We need a standardized mechanism to enforce Attribute-Based Access Control (ABAC) across our Node.js/TypeScript microservices.

## Decision

We will adopt **CASL (Isomorphic Authorization)** as our standard library for defining and enforcing fine-grained authorization rules across all TypeScript-based microservices.

### Implementation Strategy

1. **Decentralized Enforcement:** CASL will be implemented within the boundaries of each microservice (e.g., `orders-service`, `auth-service`). There will not be a centralized "authorization service" to prevent network bottlenecks.
2. **Stateless Identity:** Microservices will extract the user's identity and role from the in-memory verified JWT.
3. **Ability Factories:** Each microservice will implement a CASL "Ability Factory". This factory takes the JWT payload (identity and role) and constructs an in-memory `Ability` object containing the permission rules specific to that service's domain entities.
4. **Resource Evaluation:** When a request attempts to access or modify a specific resource (e.g., an Order), the microservice will first retrieve the resource from its local database, and then use the CASL `Ability` to evaluate ownership/permissions: `ability.can('update', order)`.
5. **Integration with NestJS:** We will leverage CASL's integration patterns for NestJS, creating custom decorators (e.g., `@CheckPolicies()`) and guards (`PoliciesGuard`) to declaratively enforce rules at the controller or service level.

## Consequences

### Positive

- **Fine-Grained Control:** Allows complex, rule-based permissions (ABAC) beyond simple roles.
- **Security by Design:** Business authorization logic is consolidated in "Ability Factories", making it highly visible, testable, and less prone to accidental bypasses in random service methods.
- **High Performance:** Permissions are evaluated entirely in memory on the microservice after the resource is fetched, maintaining the low-latency objectives of the architecture.
- **Isomorphic:** The same CASL rules could theoretically be shared with a frontend SPA in the future if needed.

### Negative

- **Learning Curve:** Developers need to understand CASL's syntax (`can`, `cannot`) and how to properly construct abilities.
- **Microservice Duplication:** The baseline definition of roles might be slightly duplicated across services, though the specific resource rules will be unique to each service's domain.
