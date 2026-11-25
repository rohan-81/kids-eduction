// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude large non-app directories (Python backend, virtual environments, git)
// from Metro file watcher to prevent EMFILE (too many open files) errors on Windows.
const exclusionList = [
  /.*[/\\]backend[/\\].*/,
  /.*[/\\]venv[/\\].*/,
  /.*[/\\]\.git[/\\].*/,
];

if (Array.isArray(config.resolver.blockList)) {
  config.resolver.blockList.push(...exclusionList);
} else if (config.resolver.blockList) {
  config.resolver.blockList = [config.resolver.blockList, ...exclusionList];
} else {
  config.resolver.blockList = exclusionList;
}

module.exports = config;
