import '@testing-library/react-native/matchers';

// expo-haptics tries to reach a live Metro dev-server socket at import time,
// which only breaks under Jest here (not in packages/ui) because this app
// has a real app.json. Haptics can't do anything headless anyway.
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

// lucide-react-native's icon context crashes under this monorepo's pnpm
// dependency graph (multiple physical "react" copies get resolved across
// packages, so useContext sees the wrong instance — reproducible even in
// packages/ui's own Button.test.tsx, unrelated to this app). Icons are
// decorative; stub every name @dashroute/ui's Icon.native.tsx imports.
jest.mock('lucide-react-native', () => {
  const { createElement } = require('react');
  const stub = (name: string) => {
    const Stub = (props: Record<string, unknown>) => createElement('lucide-icon', { ...props, 'data-icon': name });
    Stub.displayName = name;
    return Stub;
  };
  return new Proxy({}, { get: (_, name: string) => stub(name) });
});
