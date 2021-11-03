
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default [{
  input: 'src/modern-async.mjs',
  external: ['nanoassert', 'core-js-pure/features/set-immediate', 'core-js-pure/features/clear-immediate'],
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
    commonjs()
  ]
}]
