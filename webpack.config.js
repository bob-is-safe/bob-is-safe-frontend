module.exports = function (webpackEnv) {
  // ...
  return {
    // ...
    resolve: {
      // ...
      fallback: {
        // 👇️👇️👇️ add this 👇️👇️👇️
        assert: require.resolve('assert')
      }
    }
  }
}
