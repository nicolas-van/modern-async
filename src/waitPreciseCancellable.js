
import assert from 'assert'
import waitCancellable from './waitCancellable'
import Deferred from './Deferred'

/**
 * Waits a given amount of time. This function is similar to waitCancellable()
 * except it ensures that the amount of time measured using the Date object is
 * always greater than or equal the asked amount of time.
 *
 * @param {number} amount An amount of time in milliseconds
 * @returns {Array} A tuple of two objects:
 *   * The promise
 *   * The cancel function
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
    lastCancel()
  }]
}

export { _innerWaitPreciseCancellable }
