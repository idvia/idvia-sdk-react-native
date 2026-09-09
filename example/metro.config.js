const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Let Metro see the SDK package (compiled lib/) one level up.
config.watchFolders = [workspaceRoot];
config.resolver.extraNodeModules = {
  '@trustcloud/react-native-sdk': workspaceRoot,
  // Force single copies of the peer deps from the example's own node_modules.
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  'react-native-webview': path.resolve(projectRoot, 'node_modules/react-native-webview'),
  'expo-web-browser': path.resolve(projectRoot, 'node_modules/expo-web-browser'),
};

// Make the example's node_modules authoritative: without this, Metro's
// hierarchical lookup can resolve the workspace root's react/react-native
// for SDK imports, bundling two React copies.
config.resolver.blockList = [
  new RegExp(`^${path.resolve(workspaceRoot, 'node_modules').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/.*$`),
];

module.exports = config;
