
import delayCancellable from './delayCancellable.mjs'

/**
 * A function returning a promise that will be resolved in a later tick of the event loop.
 *
 * This function simply uses `setTimeout()` internally as it's the most portable solution.
 *
 * @returns {Promise} A promise that will be resolved on a later tick of the event loop.
 * @example
 * import { delay, asyncRoot } from 'modern-async'
 *
 * asyncRoot(async () => {
 *   console.log('this execute in a tick of the event loop')
 *   await delay()
 *   console.log('this execute in another tick of the event loop')
 * })
 */
async function delay () {
  return delayCancellable()[0]
}

export default delay
