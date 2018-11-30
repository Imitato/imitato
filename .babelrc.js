const presets = [
  [
    '@babel/env',
    {
      targets: {
        browsers: ['last 3 Chrome versions'],
      },
    },
  ],
  '@babel/react',
]
const plugins = ['@babel/plugin-proposal-class-properties']

module.exports = {
  presets,
  plugins,
}
