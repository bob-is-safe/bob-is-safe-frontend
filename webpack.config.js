const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = function (webpackEnv) {

  // ...
  return {
    // ...
    resolve: {
      // ...
      fallback: {
        // 👇️👇️👇️ add this 👇️👇️👇️
        assert: require.resolve('assert'),
        https: false,
        http: false,
        zlib: false,
        crypto: false
      }
    }, 
    plugins: [
        new NodePolyfillPlugin()
    ],
    target: 'node'
  }
}
