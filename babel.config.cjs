module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        firefox: '53',
        chrome: '55',
        edge: '15',
        safari: '11',
        android: '87',
        ios: '11',
        node: '10'
      }
    }]
  ]
}
