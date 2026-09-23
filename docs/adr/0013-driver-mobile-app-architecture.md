# ADR 0013: Driver Mobile App Architecture

## Status

Accepted

## Context

DashRoute requires a mobile application for couriers (repartidores) to receive orders, update their status, and send real-time geolocation updates to the Dispatch and Geolocation services.
The mobile app needs to be performant, quick to develop, and easily integrated into the existing polyglot monorepo. We need to decide on the core technologies: the framework, the routing paradigm, and the UI component library.

## Decision

We will build the mobile application using:

1. **React Native with Expo**: Provides a robust, managed workflow that simplifies native module integration (like Location) and speeds up development across both iOS and Android.
2. **Expo Router**: We will use file-based routing provided by Expo Router for navigating between screens, ensuring predictable navigation flows and deeplinking support.
3. **StyleSheet + Design Tokens**: We will use React Native's standard `StyleSheet.create()` combined with a shared `ui-tokens` package that provides our custom design tokens as JavaScript objects, avoiding intermediate abstraction layers like Tailwind CSS.
4. **Data Fetching — Axios + TanStack Query**: All server calls go through a shared `axios` instance (`src/lib/api.ts`), with request/response interceptors handling token attachment and refresh-on-401. Every call site (starting with courier login) wraps that instance in **TanStack Query** (`useQuery`/`useMutation`), so loading, error and cache state are handled consistently instead of ad hoc `useState` per screen.
5. **Validation — Zod + react-hook-form**: Form input is validated with **Zod** schemas, mirroring the schema shape the backend already uses for the same endpoint (e.g. the mobile login schema mirrors `services/auth-service`'s `login.dto.ts`). Schemas are wired into forms via **react-hook-form** and `@hookform/resolvers/zod`, giving field-level errors without hand-rolled validation logic.
6. **Testing — Jest + `jest-expo` + Testing Library, co-located**: App-level feature code (`src/features/**`) is tested with plain, co-located `Foo.test.tsx`/`Foo.test.ts` files next to the source they cover, run with Jest (`jest-expo` preset) and `@testing-library/react-native`. This reuses the exact tooling `packages/ui` already validated for native component tests (see `packages/ui/README.md`, "Testing"), rather than a separate mirrored `tests/unit/` tree.

The source code for the client applications will reside in an `apps/` directory within the monorepo root (e.g., `apps/mobile-driver`).

## Consequences

### Positive

- **Rapid Development**: Expo's managed workflow allows for rapid iteration and over-the-air updates.
- **Performant and Flexible Styling**: Direct use of StyleSheet and `ui-tokens` eliminates unnecessary compilation steps and dependencies.
- **Monorepo Integration**: Adding an `apps/` directory aligns with standard monorepo structures, separating frontend clients from backend `services/` and shared `packages/`.
- **Easy Geolocation**: `expo-location` simplifies access to background and foreground device coordinates.
- **Consistent Server State**: TanStack Query removes per-screen boilerplate for loading/error/retry handling and gives every feature a shared caching strategy from day one.
- **Client/Server Schema Consistency**: Using Zod on both sides means the mobile app's validation rules can be visually diffed against the backend DTO they call, catching drift early.
- **Proven Test Tooling**: Reusing `packages/ui`'s Jest/`jest-expo`/Testing Library setup means the app's test infra is already known to work on this stack, with no new tooling to evaluate.

### Negative

- **Monorepo Tooling Overhead**: Integrating React Native/Expo into a pnpm workspace requires careful configuration of the React Native bundler (Metro) to resolve symlinked workspace dependencies if we ever share code with `packages/`.
- **Additional Runtime Dependencies**: TanStack Query and react-hook-form are two more runtime dependencies to keep updated, on top of Zod.
- **Duplicated Test Config**: Since there is no shared root Jest config, `apps/mobile-driver` carries its own `jest.config.js` (mirroring `packages/ui`'s) instead of inheriting one.
