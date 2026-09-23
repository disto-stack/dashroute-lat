// Storybook's on-device UI ships its own NavigationContainer. Mounting it as
// a route inside Expo Router's own NavigationContainer nests two containers,
// which triggers a react-navigation bug ("Couldn't find an UnhandledLinkingContext
// context.", https://github.com/react-navigation/react-navigation/issues/13051).
// So when Storybook is enabled we replace the entry point entirely instead of
// routing to it — see docs/adr/0018-storybook-documentation-strategy.md.
if (process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true') {
  const { registerRootComponent } = require('expo');
  const StorybookUIRoot = require('@dashroute/ui/.storybook-native').default;
  registerRootComponent(StorybookUIRoot);
} else {
  require('expo-router/entry');
}
