import '@testing-library/react-native/matchers';

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const useSharedValue = (initial: unknown) => React.useRef({ value: initial }).current;
  return {
    __esModule: true,
    default: { createAnimatedComponent: (Component: unknown) => Component },
    useSharedValue,
    useAnimatedProps: (factory: () => Record<string, unknown>) => factory(),
    withRepeat: (animation: unknown) => animation,
    withSequence: (...animations: unknown[]) => animations[animations.length - 1],
    withTiming: (toValue: unknown) => toValue,
    Easing: { out: (fn: unknown) => fn, ease: () => 0 },
  };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

jest.mock('lucide-react-native', () => {
  const { createElement } = require('react');
  const stub = (name: string) => {
    const Stub = (props: Record<string, unknown>) => createElement('lucide-icon', { ...props, 'data-icon': name });
    Stub.displayName = name;
    return Stub;
  };
  return new Proxy({}, { get: (_, name: string) => stub(name) });
});
