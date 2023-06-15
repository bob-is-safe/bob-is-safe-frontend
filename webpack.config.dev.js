require('dotenv').config()
module.exports = function (_webpackEnv) {
  // ...
  return {
    // ...
    resolve: {
      // ...
      fallback: {
        // 👇️👇️👇️ add this 👇️👇️👇️
        assert: require.resolve('assert'),
      },
    },
  }
}
