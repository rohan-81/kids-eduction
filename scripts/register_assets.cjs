/**
 * Node preload for running the app's TypeScript data modules outside Metro/Jest
 * (e.g. scripts/export_static_data.ts):
 *
 *   node -r ./scripts/register_assets.cjs scripts/export_static_data.ts
 *   (or: npm run export:data)
 *
 * 1. Asset requires (png/mp3/...) resolve to their file name, as the backend importer expects.
 * 2. `react-native` and native Expo modules are aliased to the lightweight Jest mocks. The real
 *    react-native 0.88 entry ships untranspiled Flow (`import typeof ...`), which esbuild/tsx
 *    and plain Node cannot parse ("Unexpected typeof"), and static data extraction never needs
 *    native code anyway.
 * 3. .ts/.tsx files are transpiled with the project's own `typescript` (no extra dependency).
 */
const path = require('path');
const Module = require('module');

const root = path.resolve(__dirname, '..');
const mocks = path.join(root, 'tests', 'mocks');

['.jpg', '.jpeg', '.png', '.webp', '.mp3', '.wav', '.gif', '.svg', '.m4a', '.ogg'].forEach((ext) => {
  require.extensions[ext] = (module, filename) => {
    module.exports = path.basename(filename);
  };
});

const memoryStore = new Map();
const STUBS = {
  '@react-native-async-storage/async-storage': {
    __esModule: true,
    default: {
      getItem: async (k) => (memoryStore.has(k) ? memoryStore.get(k) : null),
      setItem: async (k, v) => void memoryStore.set(k, String(v)),
      removeItem: async (k) => void memoryStore.delete(k),
      multiRemove: async (ks) => ks.forEach((k) => memoryStore.delete(k)),
      getAllKeys: async () => Array.from(memoryStore.keys()),
      clear: async () => memoryStore.clear(),
    },
  },
  'expo-router': {
    __esModule: true,
    router: { push() {}, replace() {}, back() {} },
    useRouter: () => ({ push() {}, replace() {}, back() {} }),
    useLocalSearchParams: () => ({}),
    Link: () => null,
  },
};

const ALIASES = {
  'react-native': path.join(mocks, 'reactNativeMock.js'),
  'react-native-svg': path.join(mocks, 'reactNativeSvgMock.js'),
  'expo-constants': path.join(mocks, 'expoConstantsMock.js'),
  'expo-image': path.join(mocks, 'expoImageMock.js'),
  'expo-speech': path.join(mocks, 'expoSpeechMock.js'),
};

const STUB_PREFIX = '\0kidszone-stub:';
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function resolveWithAliases(request, parent, ...rest) {
  if (Object.prototype.hasOwnProperty.call(ALIASES, request)) return ALIASES[request];
  if (Object.prototype.hasOwnProperty.call(STUBS, request)) return STUB_PREFIX + request;
  return originalResolve.call(this, request, parent, ...rest);
};

const originalLoad = Module._load;
Module._load = function loadWithStubs(request, parent, ...rest) {
  if (Object.prototype.hasOwnProperty.call(STUBS, request)) return STUBS[request];
  return originalLoad.call(this, request, parent, ...rest);
};

// TypeScript transpilation (CommonJS) for .ts/.tsx, unless another loader already owns them.
const ts = require('typescript');
const compilerOptions = {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2020,
  jsx: ts.JsxEmit.React,
  esModuleInterop: true,
  allowSyntheticDefaultImports: true,
  resolveJsonModule: true,
};
for (const ext of ['.ts', '.tsx']) {
  require.extensions[ext] = (module, filename) => {
    const source = require('fs').readFileSync(filename, 'utf8');
    const { outputText } = ts.transpileModule(source, { compilerOptions, fileName: filename });
    module._compile(outputText, filename);
  };
}
