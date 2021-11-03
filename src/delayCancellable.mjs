
import Deferred from './Deferred.mjs'
import CancelledError from './CancelledError.mjs'
import setImmediate from 'core-js-pure/features/set-immediate.js'
import clearImmediate from 'core-js-pure/features/clear-immediate.js'

/**
 * A function returning a promise that will be resolved in a later tick of the event loop.
 *
 * This function returns both a promise and cancel function in order to cancel the wait time if
 * necessary. If cancelled, the promise will be rejected with a CancelledError.
 *
 * This function uses core-js' shim for `setImmediate()` internally.
 *
 * @returns {Array} A tuple of two objects:
 *   * The promise
 *   * The cancel function. It will return a boolean that will be true if the promise was effectively cancelled,
 *     false otherwise.
 * @example
 * import { delayCancellable, CancelledError } from 'modern-async'
 *
 * const [promise, cancel] = delayCancellable()
 * cancel()
 * try {
 *   await promise
 * } catch (e) {
 *   console.log(e instanceof CancelledError) // prints true
 * }
 */
function delayCancellable () {
  const deferred = new Deferred()
  const id = setImmediate(deferred.resolve)
  let terminated = false
  return [deferred.promise.finally(() => {
    terminated = true
  }), () => {
    if (terminated) {
      return false
    } else {
      terminated = true
      deferred.reject(new CancelledError())
      clearImmediate(id)
      return true
    }
  }]
}

export default delayCancellable
