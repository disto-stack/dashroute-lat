const jestExpoPreset = require('jest-expo/jest-preset');

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/src/**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // jest-expo's default only transforms RN/Expo packages; our tests also import
  // ESM-only `storybook`/`@storybook/*` packages (composeStories, storybook/test)
  // and `lucide-react-native` ships an ESM .mjs build — neither is covered by default.
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|storybook|@storybook|lucide-react-native))',
  ],
  transform: {
    ...jestExpoPreset.transform,
    '\\.mjs$': jestExpoPreset.transform['\\.[jt]sx?$'],
  },
};
