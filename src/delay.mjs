
import delayCancellable from './delayCancellable.mjs'

/**
 * A function returning a promise that will be resolved in a later task of the event loop.
 *
 * This function simply uses `setTimeout()` internally as it's the most portable solution.
 *
 * To understand the difference between using `setTimeout()` and using a callback on a resolved
 * promise, see MDN's documentation on tasks and microtasks:
 * https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide
 *
 * @returns {Promise} A promise that will be resolved on a later tick of the event loop.
 * @example
 * import { delay, asyncRoot } from 'modern-async'
 *
 * asyncRoot(async () => {
 *   console.log('this executes in a tick of the event loop')
 *   await delay()
 *   console.log('this executes in another tick of the event loop')
 * })
 */
async function delay () {
  return delayCancellable()[0]
}

export default delay
