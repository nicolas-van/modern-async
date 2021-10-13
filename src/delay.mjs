
/**
 * A function returning a promise that will be resolved in a later tick of the event loop.
 *
 * This function simply uses `Promise.resolve()` internally.
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
  return Promise.resolve()
}

export default delay
