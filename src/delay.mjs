
import delayCancellable from './delayCancellable.mjs'

/**
 * A function returning a promise that will be resolved in a later task of the event loop.
 *
 * This function uses core-js' shim for `setImmediate()` internally.
 *
 * @returns {Promise<void>} A promise that will be resolved on a later tick of the event loop.
 * @example
 * import { delay } from 'modern-async'
 *
 * console.log('this executes in a tick of the event loop')
 * await delay()
 * console.log('this executes in another tick of the event loop')
 */
async function delay () {
  return delayCancellable()[0]
}

export default delay
