
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { getBabelOutputPlugin } from '@rollup/plugin-babel'

export default [{
  input: 'src/modern-async.mjs',
  output: {
    file: 'dist/modern-async.cjs',
    format: 'cjs'
  },
  plugins: []
}, {
  input: 'src/modern-async-umd.mjs',
  output: {
    file: 'dist/modern-async.umd.js',
    format: 'esm'
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    getBabelOutputPlugin({
      presets: [
        ['@babel/preset-env', {
          targets: {
            ie: '8'
          }
        }]
      ],
      plugins: [
        ['@babel/plugin-transform-modules-umd',{
          globals: {
            unknown: 'modernAsync'
          }
        }]
      ]
    })
  ]
}]
