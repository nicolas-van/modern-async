
import sleepCancellable from './sleepCancellable.mjs'

/**
 * A function returning a promise that will be resolved in a later tick of the event loop.
 *
 * This function returns both a promise and cancel function in order to cancel the wait time if
 * necessary. If cancelled, the promise will be rejected with a CancelledError.
 *
 * This function simply uses `setTimeout()` internally as it's the most portable solution.
 *
 * @returns {Array} A tuple of two objects:
 *   * The promise
 *   * The cancel function. It will return a boolean that will be true if the promise was effectively cancelled,
 *     false otherwise.
 * @example
 * import { delayCancellable, asyncRoot, CancelledError } from 'modern-async'
 *
 * asyncRoot(async () => {
 *   const [promise, cancel] = delayCancellable()
 *   cancel()
 *   try {
 *     await promise
 *   } catch (e) {
 *     console.log(e instanceof CancelledError) // prints true
 *   }
 * })
 */
function delayCancellable () {
  return sleepCancellable(0)
}

export default delayCancellable
