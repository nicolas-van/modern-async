
import assert from 'assert'
import waitCancellable from './waitCancellable'
import Deferred from './Deferred'

/**
 * Waits a given amount of time. This function is similar to waitCancellable()
 * except it ensures that the amount of time measured using the Date object is
 * always greater than or equal the asked amount of time. This function returns both a
 * promise and cancel function in order to cancel the wait time if necessary. If cancelled,
 * the promise will be rejected with a CancelledError.
 *
 * This function implies additional delay that can be bad for performances. As such it is
 * recommended to only use it in unit tests or very specific cases. Most applications should
 * be adapted to work with the usual setTimout() inconsistencies even if it can trigger some
 * milliseconds before the asked delay.
 *
 * @param {number} amount An amount of time in milliseconds
 * @returns {Array} A tuple of two objects:
 *   * The promise
 *   * The cancel function. It will return a boolean that will be true if the promise was effectively cancelled,
 *     false otherwise.
 */
export default function waitPreciseCancellable (amount) {
  return _innerWaitPreciseCancellable(amount, (ellasped, amount) => {
    return ellasped >= amount
  })
}

/**
 * @ignore
 *
 * @param {*} amount ignored
 * @param {*} checkPassed ignored
 * @returns {*} ignored
 */
function _innerWaitPreciseCancellable (amount, checkPassed) {
  assert(typeof amount === 'number', 'amount must be a number')
  const start = new Date().getTime()
  const [p, cancel] = waitCancellable(amount)
  let lastCancel = cancel
  const deferred = new Deferred()
  const reject = (e) => {
    deferred.reject(e)
  }
  const resolve = () => {
    const now = new Date().getTime()
    const ellasped = now - start
    if (checkPassed(ellasped, amount)) {
      deferred.resolve()
    } else {
      const [np, ncancel] = waitCancellable(amount - ellasped)
      lastCancel = ncancel
      np.then(resolve, reject)
    }
  }
  p.then(resolve, reject)
  return [deferred.promise, () => {
    return lastCancel()
  }]
}

export { _innerWaitPreciseCancellable }
