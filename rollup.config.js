
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'

export default [{
  input: 'src/modern-async.mjs',
  external: ['nanoassert'],
  output: {
    file: 'dist/modern-async.cjs',
    format: 'cjs'
  },
  plugins: []
}, {
  input: 'src/modern-async.mjs',
  output: {
    file: 'dist/modern-async.umd.js',
    format: 'umd',
    name: 'modernAsync'
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    babel({ babelHelpers: 'bundled' })
  ]
}]
