
import assert from 'nanoassert'
import Deferred from './Deferred.mjs'
import CancelledError from './CancelledError.mjs'

/**
 * Waits a given amount of time. This function returns both a promise and cancel function in
 * order to cancel the wait time if necessary. If cancelled, the promise will be rejected
 * with a `CancelledError`.
 *
 * This function uses `setTimeout()` internally and has the same behavior, notably that it could resolve
 * after the asked time (depending on other tasks running in the event loop) or a few milliseconds before.
 *
 * @param {number} amount An amount of time in milliseconds
 * @returns {Array} A tuple of two objects:
 *   * `promise`: The promise
 *   * `cancel`: The cancel function. It will return a boolean that will be `true` if the promise was effectively cancelled,
 *     `false` otherwise.
 * @example
 * import { sleepCancellable } from 'modern-async'
 *
 * const [promise, cancel] = sleepCancellable(100) // schedule to resolve the promise after 100ms
 *
 * cancel()
 *
 * try {
 *   await promise
 * } catch (e) {
 *   console.log(e.name) // prints CancelledError
 * }
 */
function sleepCancellable (amount) {
  assert(typeof amount === 'number', 'amount must be a number')
  const deferred = new Deferred()
  const id = setTimeout(deferred.resolve, amount)
  let terminated = false
  return [deferred.promise.finally(() => {
    terminated = true
  }), () => {
    if (terminated) {
      return false
    } else {
      terminated = true
      deferred.reject(new CancelledError())
      clearTimeout(id)
      return true
    }
  }]
}

export default sleepCancellable
