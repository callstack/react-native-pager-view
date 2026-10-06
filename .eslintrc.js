module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: ['node_modules/', 'lib/'],
  globals: {
    expect: true,
    beforeAll: true,
    beforeEach: true,
    describe: true,
    it: true,
    afterAll: true,
    jest: true,
    jasmine: true,
  },
};
