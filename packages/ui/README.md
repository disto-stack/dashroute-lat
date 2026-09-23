# @dashroute/ui

Shared component library for DashRoute's web (`apps/admin-web`) and native (`apps/mobile-driver`) apps. See `docs/adr/0015-design-system-strategy.md` for the dual-file component strategy and `docs/adr/0018-storybook-documentation-strategy.md` for why documentation runs as two separate Storybook instances.

## Component layout

Each component folder follows:

```
src/Button/
├── Button.tsx            # web: CSS Modules + rn-primitives (Radix)
├── Button.native.tsx     # native: StyleSheet + rn-primitives (native)
├── Button.types.ts       # shared props
├── Button.module.css
├── Button.stories.tsx        # web stories (Storybook)
├── Button.stories.native.tsx # native stories (Storybook)
└── index.ts
```

Not every component has a native implementation yet (`OrderStatusBadge`, `Sidebar`, `Select`, `DataTable`, `DetailPanel` are web-only) — those only get `Foo.stories.tsx` until a `.native.tsx` variant exists.

When writing stories, always import the platform variant relatively (`./Button`), never via `@dashroute/ui`, so each bundler's platform-extension resolution picks the right file.

## Running Storybook

**Web** (standalone, no Expo/simulator needed):

```sh
pnpm storybook:web
```

Opens at `http://localhost:6006`, rendering against the real tokens from `@dashroute/ui-tokens/tokens.css`.

**Native** (runs through `apps/mobile-driver`'s Expo/Metro runtime, since `@storybook/react-native` has no bundler of its own):

```sh
pnpm storybook:mobile
```

Open the app in the simulator, a device, or Expo Go — it boots **directly into Storybook**, no navigation needed. This works by swapping `apps/mobile-driver`'s entry point (`index.js`) rather than adding a route: Storybook's on-device UI ships its own `NavigationContainer`, and nesting it inside Expo Router's own container triggers a react-navigation bug (`Couldn't find an UnhandledLinkingContext context.`). To go back to the real app, stop the dev server and run `pnpm dev:mobile-driver` (or `start`) instead — the two don't coexist in the same running instance. The existing hand-built showcase at `apps/mobile-driver/src/app/design-system.tsx` (`/design-system` route, the real app's default screen) is unaffected either way.

## Adding stories to a new component

1. Add `Foo.stories.tsx` next to `Foo.tsx`, importing `./Foo`.
2. If a `Foo.native.tsx` exists, add `Foo.stories.native.tsx` importing `./Foo` as well — Metro resolves it to the native variant.
3. Restart `storybook:web` / `storybook:mobile` if the dev server was already running when the files were added.
4. If the component has real interaction (a click, a form change, a callback prop), add a `play` function to the web story using `storybook/test` (`within`, `userEvent`, `expect`, `fn` — all bundled in Storybook core, no extra install). It runs live in the "Interactions" panel when you open the story, and headlessly via `pnpm test`.

## Testing

Web stories double as tests — no separate test files:

```sh
pnpm test        # runs every story's `play` function headlessly (Vitest + Playwright/Chromium)
pnpm test:watch  # same, in watch mode
```

This also runs an accessibility check (`@storybook/addon-a11y`, axe-core) against every web story when you open it in the running Storybook UI (panel "Accessibility"). See `docs/adr/0018-storybook-documentation-strategy.md` for the testing rationale — this is meant to be wired into the project's GitHub Actions pipeline once it exists; `turbo.json`'s `test` task already picks up this package's `test` script automatically.

**Native components have a separate, real headless test path — not a `play` function.** `storybook/test`'s `within`/`userEvent` only work against a DOM, and React Native has none, so those queries do nothing useful inside the on-device Storybook UI. Instead, native components are tested via Storybook's ["Portable Stories"](https://github.com/storybookjs/react-native/blob/next/PORTABLE_STORIES.md): a plain `Foo.test.tsx` next to the component reuses the `.stories.native.tsx` file's `args` via `composeStories`, and renders/asserts with `@testing-library/react-native` under Jest (`jest-expo` preset) — no simulator needed, since it renders with `react-test-renderer`, not a real device.

```sh
pnpm test:native
```

Example (`Button.test.tsx`):

```tsx
import { render, screen, userEvent } from '@testing-library/react-native';
import { composeStories } from '@storybook/react';
import * as stories from './Button.stories.native';

const { Primary } = composeStories(stories);

test('calls onClick when pressed', async () => {
  const onClick = jest.fn();
  await render(<Primary onClick={onClick} />); // render() is async in v14 — always await it

  const user = userEvent.setup();
  await user.press(screen.getByText('Continuar'));

  expect(onClick).toHaveBeenCalledTimes(1);
});
```

Only components with a `.native.tsx` implementation and real interaction have a `.test.tsx` today (`Button`, `Input`, `BottomSheet`, `MissionCard`). `turbo.json`'s `test:native` task picks up this script the same way `test` does, so both can run in CI once the pipeline exists.
