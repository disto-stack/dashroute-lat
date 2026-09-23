# ADR 0018: Storybook Documentation Strategy

## Status

Accepted

## Context

ADR 0015 established DashRoute's design system (`packages/ui`, `packages/ui-tokens`) around a dual-file component pattern: every shared component ships a web implementation (`Foo.tsx`, CSS Modules + `rn-primitives`/Radix) and, where it applies, a native implementation (`Foo.native.tsx`, React Native `StyleSheet` + `rn-primitives` native), resolved automatically by each consumer's bundler — Turbopack/webpack in `apps/admin-web`, Metro in `apps/mobile-driver`. That ADR explicitly anticipated Storybook as the natural next step for documenting the system, noting that dropping Tailwind/NativeWind in favor of native CSS Modules and `StyleSheet` would make "setting up Storybook in the future... straightforward for both web and mobile."

No documentation tooling for `packages/ui` exists yet: no Storybook config, no README in `packages/ui` or `packages/ui-tokens`. The only existing reference is a hand-built showcase screen at `apps/mobile-driver/src/app/design-system.tsx`, which demonstrates composed screens rather than isolated components.

The core problem is that web and native components render through fundamentally different pipelines (DOM vs. native views). A single Storybook instance that renders native components through `react-native-web` would only *approximate* native rendering — it would not exercise real platform accessibility semantics, `Pressable` press states, or native modules such as `expo-haptics` used in `Button.native.tsx`. Given the design system's entire premise is platform-accurate dual implementations, an approximation undermines the point of documenting the native variant at all.

Separately, `@storybook/react-native` (the current, actively maintained package under that scope) has no bundler of its own: it requires a real Metro/Expo host to run in, unlike a web-based Storybook builder (e.g. `@storybook/react-vite`), which ships its own dev server and can run standalone.

## Decision

We will run two separate Storybook instances, one per platform, rather than a single instance approximating both:

1. **Web Storybook** — lives entirely inside `packages/ui`, standalone:
   - Config at `packages/ui/.storybook-web/` (`main.ts`, `preview.tsx`).
   - Uses `@storybook/react-vite` rather than `@storybook/nextjs`, since no component in `packages/ui` uses any Next.js-specific API; Vite is sufficient and keeps the design system's docs tooling decoupled from `apps/admin-web`'s framework.
   - `preview.tsx` imports `@dashroute/ui-tokens/tokens.css` globally, the same way `apps/admin-web/src/app/layout.tsx` does, so stories render against real design tokens.
   - Runs via `pnpm --filter @dashroute/ui storybook:web`.

2. **Native Storybook** — configuration co-located in `packages/ui`, runtime delegated to `apps/mobile-driver`:
   - Config at `packages/ui/.storybook-native/` (`main.ts`, `preview.tsx`, `index.tsx`), so story authoring stays next to the components, not scattered into the consumer app.
   - `apps/mobile-driver/metro.config.js` wraps its Metro config with `@storybook/react-native/metro/withStorybook`, pointing `configPath` at `packages/ui/.storybook-native` and gating it behind `EXPO_PUBLIC_STORYBOOK_ENABLED=true` so Storybook is stripped from normal bundles (Metro's resolver replaces any `storybook`/`@storybook` import with an empty module when disabled — nothing extra ships in production).
   - **The app's entry point is swapped, not routed to.** `apps/mobile-driver/index.js` (set as `"main"` in `package.json`, replacing the default `"expo-router/entry"`) checks `EXPO_PUBLIC_STORYBOOK_ENABLED` *before* Expo Router mounts: if enabled, it calls `registerRootComponent` directly with `@dashroute/ui`'s generated Storybook UI; otherwise it defers to `expo-router/entry` as before. We initially tried a dedicated Expo Router route (`/storybook`) instead, but Storybook's on-device UI ships its own `NavigationContainer`, and mounting it *inside* Expo Router's own `NavigationContainer` nests two containers — which hits a react-navigation bug (`Couldn't find an UnhandledLinkingContext context.`, [react-navigation#13051](https://github.com/react-navigation/react-navigation/issues/13051)) triggered by a portaled/nested container while linking is still resolving. Swapping the entry point means only one `NavigationContainer` (Storybook's) ever mounts, so the bug doesn't trigger.
   - Runs via `pnpm --filter dashroute-mobile-driver storybook` (`EXPO_PUBLIC_STORYBOOK_ENABLED=true expo start`), then opening the app in the simulator/device/Expo Go — it boots directly into Storybook, no navigation needed.
   - We deliberately did not give `packages/ui` its own Expo project to run native Storybook in isolation — that would duplicate `app.json`, `babel.config.js`, `metro.config.js`, and native dependencies that `apps/mobile-driver` already maintains, for no benefit.

3. **Story file convention** mirrors the existing `.tsx`/`.native.tsx` split exactly: `Foo.stories.tsx` (web) and `Foo.stories.native.tsx` (native), co-located per component, both importing the relative `./Foo` (not the `@dashroute/ui` package barrel) so each bundler's platform-extension resolution picks the correct variant. Components without a `.native.tsx` implementation yet (`OrderStatusBadge`, `Sidebar`, `Select`, `DataTable`, `DetailPanel`) get only `Foo.stories.tsx` until a native variant exists.

4. The existing manual showcase (`apps/mobile-driver/src/app/design-system.tsx`) is retained as-is. Storybook documents components in isolation with controls/variants; the showcase demonstrates real composed screens. Neither replaces the other.

5. **Testing** runs through the web Storybook instance, since it needs no simulator/device:
   - **Accessibility**: `@storybook/addon-a11y` runs axe-core against every web story automatically (registered in `packages/ui/.storybook-web/main.ts`).
   - **Interaction tests**: stories with real user interaction (`Button`, `Sidebar`, `DataTable`, `BottomSheet`, `DetailPanel`, `Select`, `Input`, `MissionCard`) declare a `play` function using `storybook/test` (bundled in Storybook core — no extra package), asserting on clicks, form changes, and callback args.
   - **Headless execution**: `@storybook/addon-vitest` (scaffolded via `npx storybook add @storybook/addon-vitest`) runs those same `play` functions headlessly through Vitest's browser mode with the Playwright provider (`packages/ui/vitest.config.ts`, `configDir` pointed at `.storybook-web`). `pnpm --filter @dashroute/ui test` runs them; this is intended to be wired into the project's GitHub Actions pipeline once that pipeline exists — `turbo.json`'s existing `test` task already picks up this package's `test` script with no further changes needed.
   - **Native testing is a genuinely different mechanism, not a `play` function.** `storybook/test`'s `within`/`userEvent` are backed by `@testing-library/dom`, which has nothing to query on React Native's host components — there is no DOM. Instead, native components are tested via Storybook's "Portable Stories" (`composeStories` from `@storybook/react`, documented at [storybookjs/react-native/PORTABLE_STORIES.md](https://github.com/storybookjs/react-native/blob/next/PORTABLE_STORIES.md)): a `Foo.test.tsx` next to the component reuses a `.stories.native.tsx` story's `args`, and renders/asserts with `@testing-library/react-native` under Jest (`jest-expo` preset), using `react-test-renderer` — no simulator/device needed, so this one *can* run headlessly in CI (`pnpm --filter @dashroute/ui test:native`). Two `jest.config.js` details were required beyond the default `jest-expo` preset: `transformIgnorePatterns` had to allow `storybook`/`@storybook` (ESM-only) and `lucide-react-native` (ships a `.mjs` build); and the preset's `transform` map only covers `.js/.jsx/.ts/.tsx`, so `.mjs` had to be added explicitly. Only components with a `.native.tsx` and real interaction have a `.test.tsx` today (`Button`, `Input`, `BottomSheet`, `MissionCard`).

## Consequences

### Positive

- Each platform renders through its real pipeline — no react-native-web approximation masking native-only behavior (haptics, native accessibility, gesture handling).
- The story convention introduces no new mental model: it extends the dual-file pattern already accepted in ADR 0015.
- Web Storybook has zero Next.js coupling and runs standalone from `packages/ui`, independent of `apps/admin-web`.
- Native Storybook reuses `apps/mobile-driver`'s existing monorepo-aware Metro configuration (`watchFolders`, `nodeModulesPaths`) instead of duplicating it.
- Both instances wire real design tokens into their preview canvas, so component stories are visually representative of production surfaces.
- Interaction tests and accessibility checks reuse the exact stories written for documentation — no separate test files or duplicated component-mounting code.

### Negative

- Two Storybook configurations to maintain instead of one.
- Every dual-platform component potentially needs two story files, the same "dual implementation" cost ADR 0015 already accepted for the components themselves.
- Viewing native Storybook requires a simulator, physical device, or Expo Go — it is not a plain browser tab the way web Storybook is, adding friction for a quick look.
- Because Storybook fully replaces the app's entry point when enabled, you cannot navigate between the real app and Storybook in the same running instance — restarting with/without `EXPO_PUBLIC_STORYBOOK_ENABLED` switches which one boots.
- Headless interaction testing adds Playwright (and its downloaded browser binaries) as a dev dependency of `packages/ui` for web, and a second, unrelated test runner (Jest + `jest-expo` + `@testing-library/react-native`) for native — two different testing stacks to maintain instead of one, because no single tool covers both DOM and React Native host components.
- Native's headless tests exercise `react-test-renderer`, not a real device — they don't catch platform-specific rendering issues (haptics behavior, real touch timing, native accessibility) the way manually verifying in the on-device Storybook UI does. They only verify the same thing web's `play` functions verify: that callbacks fire correctly.
- Alternatives considered and rejected:
  - A single Storybook using `react-native-web` to approximate both platforms — rejected for fidelity: it would not exercise real native accessibility, press states, or native modules like `expo-haptics`.
  - `@storybook/nextjs` for the web instance — rejected as unnecessary weight; `packages/ui` uses no Next.js-specific APIs.
  - A standalone Expo/Metro project inside `packages/ui` just to run native Storybook — rejected as duplicate infrastructure `apps/mobile-driver` already provides.
