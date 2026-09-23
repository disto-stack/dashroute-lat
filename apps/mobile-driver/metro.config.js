const { getDefaultConfig } = require("expo/metro-config");
const { withStorybook } = require("@storybook/react-native/metro/withStorybook");

const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot, { isCSSEnabled: true });

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = withStorybook(config, {
  // Story config lives next to the components it documents, in @dashroute/ui,
  // not inside this app — see docs/adr/0018-storybook-documentation-strategy.md.
  configPath: path.resolve(workspaceRoot, 'packages/ui/.storybook-native'),
  enabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true',
});
