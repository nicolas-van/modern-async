
import asyncDelayCancellable from './asyncDelayCancellable.mjs'

/**
 * A function returning a promise that will be resolved in a later task of the event loop.
 *
 * This function uses core-js' shim for `setImmediate()` internally.
 *
 * @returns {Promise<void>} A promise that will be resolved on a later tick of the event loop.
 * @example
 * import { asyncDelay } from 'modern-async'
 *
 * console.log('this executes in a tick of the event loop')
 * await asyncDelay()
 * console.log('this executes in another tick of the event loop')
 */
async function asyncDelay () {
  return asyncDelayCancellable()[0]
}

export default asyncDelay
