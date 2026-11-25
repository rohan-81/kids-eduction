module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^expo-speech$': '<rootDir>/tests/mocks/expoSpeechMock.js',
    '^expo-constants$': '<rootDir>/tests/mocks/expoConstantsMock.js',
    '^react-native$': '<rootDir>/tests/mocks/reactNativeMock.js',
    '^react-native-svg$': '<rootDir>/tests/mocks/reactNativeSvgMock.js',
    '^expo-image$': '<rootDir>/tests/mocks/expoImageMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg|mp3|wav|ogg|m4a)$': '<rootDir>/tests/mocks/fileMock.js',
  },
};
