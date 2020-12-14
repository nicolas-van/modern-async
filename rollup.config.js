
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default [{
  input: 'src/modern-async.mjs',
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
  plugins: [nodeResolve({
    preferBuiltins: false,
    browser: true
  }), commonjs()]
}]
