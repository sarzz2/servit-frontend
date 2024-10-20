module.exports = {
  preset: 'ts-jest', // This presets TypeScript testing
  testEnvironment: 'jsdom', // Simulates a browser environment

  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest', // Transpiles TypeScript/TSX using Babel
    '^.+\\.(js|jsx)$': 'babel-jest', // Transpiles JS/JSX using Babel
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'], // File extensions Jest should understand
};
