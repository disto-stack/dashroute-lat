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
3. **NativeWind (Tailwind CSS)**: For the UI library, we will use NativeWind to provide a fast, customizable, and standard Tailwind CSS experience. It compiles to optimized StyleSheet objects at build time, ensuring maximum runtime performance while keeping styling simple and flexible.

The source code for the client applications will reside in an `apps/` directory within the monorepo root (e.g., `apps/mobile`).

## Consequences

### Positive

- **Rapid Development**: Expo's managed workflow allows for rapid iteration and over-the-air updates.
- **Performant and Flexible Styling**: NativeWind provides the DX of Tailwind CSS without the runtime overhead, allowing rapid UI development without being locked into a predefined component system.
- **Monorepo Integration**: Adding an `apps/` directory aligns with standard monorepo structures, separating frontend clients from backend `services/` and shared `packages/`.
- **Easy Geolocation**: `expo-location` simplifies access to background and foreground device coordinates.

### Negative

- **Monorepo Tooling Overhead**: Integrating React Native/Expo into a pnpm workspace requires careful configuration of the React Native bundler (Metro) to resolve symlinked workspace dependencies if we ever share code with `packages/`.
