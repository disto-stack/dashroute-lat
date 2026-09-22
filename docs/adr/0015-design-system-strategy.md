# ADR 0015: Design System Strategy

## Status

Accepted

## Context

DashRoute requires a coherent UI design system that serves four surfaces simultaneously:

| Surface | Framework | Target Users |
| --- | --- | --- |
| Driver App | React Native + Expo | Couriers/drivers |
| Client App | React Native + Expo | End customers (mobile) |
| Admin Web | Next.js | Internal operators |
| Client Web | Next.js | End customers (web) |

The core challenge is maximizing code reuse across platforms that have fundamentally different rendering models: React Native renders to native iOS/Android views, while Next.js renders to the DOM. Furthermore, DashRoute has a specific, well-defined token system (custom colors, spacing, borders) that we want to utilize directly without arbitrary intermediate abstraction layers like Tailwind CSS.

### The Headless Primitive Solution

To build accessible, interactive components (like Dialogs, Selects, Accordions), we need robust UI primitives.

- On the web, **Radix UI** is the standard for unstyled, accessible primitives built on the DOM.
- However, React Native has no DOM, so Radix cannot be used natively.

**`rn-primitives`** bridges this gap perfectly. It provides the same set of headless UI primitives with a unified API:

- On **web**: it uses Radix UI under the hood automatically.
- On **native**: it uses its own implementations backed by each platform's native accessibility APIs.
- It ships **with no styles**, allowing us to map our custom tokens directly to the components.

## Decision

We will build DashRoute's design system utilizing `rn-primitives` and CSS Modules for the web, abandoning Tailwind CSS/NativeWind to maintain our pure design token strategy.

### 1. `packages/ui-tokens` — Single Source of Truth, Dual Export

A framework-agnostic package containing all design tokens (colors, typography, spacing). To accommodate both the web (which uses CSS) and React Native (which uses JavaScript objects), this package exports tokens in two formats:

- `tokens.css`: Exposes tokens as CSS Custom Properties (e.g., `--brand-primary: #208AEF;`) for consumption by Next.js.
- `tokens.ts`: Exposes tokens as a TypeScript object (e.g., `tokens.colors.brand.primary`) for consumption by React Native's `StyleSheet`.

### 2. Styling Strategy: CSS Modules & StyleSheet

We explicitly reject Tailwind CSS and NativeWind.

- **Web (Next.js)**: We will use **CSS Modules**. This is built into Next.js, has zero runtime cost, works perfectly with Server Components, and allows us to use our `tokens.css` variables natively.
- **Mobile (React Native)**: We will use standard React Native **`StyleSheet.create()`**, mapping the values from `tokens.ts`.

### 3. `packages/ui` — Shared Component Library

A single package containing components for all platforms, using platform-specific file extensions resolved at build time (by Metro for React Native and Webpack/Turbopack for Next.js).

```
packages/ui/src/
├── Button/
├── Button.tsx          ← Uses CSS Modules (`Button.module.css`) + rn-primitives (Web default)
│   ├── Button.native.tsx   ← Uses StyleSheet + rn-primitives (Native override)
│   ├── Button.types.ts     ← Shared TypeScript props interface
│   └── index.ts            ← export { Button }
```

Consumer code imports once, with no awareness of the platform:

```typescript
import { Button } from '@dashroute/ui';
```

## Consequences

### Positive

- **Pure Design System**: No Tailwind abstraction layer. We use our tokens directly exactly as designed.
- **Zero Runtime CSS**: CSS Modules produce static CSS, keeping the Next.js apps maximally performant and Server Component friendly.
- **Single Import Surface**: Consumer apps always import from `@dashroute/ui` regardless of platform.
- **Accessibility by Default**: `rn-primitives` provides correct ARIA roles and native accessibility semantics on every platform.
- **Simplified Storybook Setup**: Without the need to configure NativeWind or PostCSS pipelines, setting up Storybook in the future will be straightforward for both web (native CSS module support) and mobile.

### Negative

- **Dual Implementation**: Every component in `packages/ui` requires two implementation files (`.web.tsx` and `.native.tsx`) and potentially a `.module.css` file for the web.
- **Migration Cost**: The existing `apps/mobile` (now `apps/mobile-driver`) codebase heavily uses NativeWind classes (`className=`). These will need to be gradually rewritten to use `StyleSheet.create()` and the new tokens.
