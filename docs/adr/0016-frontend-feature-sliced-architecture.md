# ADR 0016: Frontend Architecture and Feature-Sliced Organization

## Status

Accepted

## Context

As the DashRoute ecosystem grows, we are developing multiple frontend clients (Driver App, Admin Web, Client App) across different frameworks (Next.js and Expo React Native). Without a standardized internal architecture for these clients, there is a high risk of:
1. Business logic leaking into presentation components.
2. Unmanageable, monolithic folders (`/components`, `/hooks`, `/services`) that group unrelated files together, making features hard to locate and refactor.
3. Duplication of domain logic across different pages or screens.

We need a structured way to separate "dumb" presentation UI from "smart" domain logic, and a scalable way to organize that domain logic within the application codebases.

## Decision

We will adopt a **Feature-Sliced Architecture** combined with a strict separation between universal UI packages and application-specific domains.

### 1. The Architectural Boundary (Dumb vs Smart)

There is a strict boundary between the UI workspace package and the applications:

- **`packages/ui` (Dumb Components):** These components must be purely representational. They receive primitive props and emit events. They **must not** contain any business logic, API calls, global state management, or domain knowledge of DashRoute (e.g., a `Button` or `Dialog`, not an `AcceptOrderButton`).
- **`apps/*` (Smart Components & Domains):** The client applications are responsible for composing the dumb components, injecting business logic, fetching data, and managing state.

### 2. Feature-Sliced Organization

Inside any application (e.g., `apps/admin-web` or `apps/mobile-driver`), source code will be organized by **business domain** (features) rather than by technical role. 

The structure will follow this pattern:

```text
apps/[app-name]/src/
├── app/                  # Routing layer (Next.js App Router or Expo Router). Binds features to URLs.
├── features/             # Business domains (The core of the app)
│   ├── orders/
│   │   ├── components/   # Smart components specific to orders (e.g., OrderList)
│   │   ├── hooks/        # React hooks for order logic (e.g., useAcceptOrder)
│   │   ├── services/     # API fetchers/mutators for orders
│   │   └── types/        # Domain-specific types
│   ├── auth/
│   └── geolocation/
├── lib/                  # Cross-feature utilities, HTTP clients (Axios setups), providers
└── components/           # (Optional) App-specific generic components that don't belong in packages/ui
```

### 3. Routing Layer Responsibilities

Files within the routing layer (e.g., Next.js `page.tsx` or Expo `screen.tsx`) should act purely as orchestrators. They should:
- Read URL parameters or route parameters.
- Import and render the smart components from the `features/` directory.
- Avoid containing complex local state or heavy JSX structures directly.

## Consequences

### Positive

- **High Cohesion:** Everything related to a specific domain (like "orders") is co-located in one directory, significantly reducing context switching during development.
- **Scalability:** New features scale horizontally (by adding a new folder in `features/`) rather than vertically inflating global folders.
- **UI Reusability:** By strictly enforcing `packages/ui` as domain-agnostic, we guarantee those components can be shared perfectly between the Admin Web and Mobile Driver apps.
- **Cognitive Consistency:** Using the exact same `app/` and `features/` structure across both React Native and Next.js reduces the learning curve when switching between projects.

### Negative

- **Initial Boilerplate:** Creating a new feature requires creating multiple sub-folders and files upfront.
- **Boundary Disputes:** Developers must actively decide if a piece of logic belongs in a generic `lib/` folder, a specific `feature/`, or if a UI component is generic enough to be pushed down into `packages/ui`.
