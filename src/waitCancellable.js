
import assert from 'assert'
import Deferred from './Deferred'
import CancelledError from './CancelledError'

/**
 * Waits a given amount of time. This function returns both a promise and cancel function in
 * order to cancel the wait time if necessary. If cancelled, the promise will be rejected
 * with a CancelledError.
 *
 * This function uses setTimeout() internally and has the same behavior, notably that it could resolve
 * after the asked time (depending on other tasks running in the event loop) or a few milliseconds before.
 *
 * @param {number} amount An amount of time in milliseconds
 * @returns {Array} A tuple of two objects:
 *   * The promise
 *   * The cancel function. It will return a boolean that will be true if the promise was effectively cancelled,
 *     false otherwise.
 */
function waitCancellable (amount) {
  assert(typeof amount === 'number', 'amount must be a number')
  let id
  const deferred = new Deferred()
  setTimeout(deferred.resolve, amount)
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

export default waitCancellable
