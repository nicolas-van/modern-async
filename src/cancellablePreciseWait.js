
import assert from 'assert'
import cancellableWait from './cancellableWait'
import Deferred from './Deferred'

/**
 * Waits a given amount of time. This function is similar to cancellableWait()
 * except it ensures that the amount of time measured using the Date object is
 * always greater than or equal the asked amount of time.
 *
 * @param {number} amount An amount of time in milliseconds
 * @returns {Array} A tuple of two objects:
 *   * The promise
 *   * The cancel function
 */
export default function cancellablePreciseWait (amount) {
  assert(typeof amount === 'number')
  const start = new Date().getTime()
  const [p, cancel] = cancellableWait(amount)
  let lastCancel = cancel
  const deferred = new Deferred()
  const reject = (e) => {
    deferred.reject(e)
  }
  const resolve = () => {
    const now = new Date().getTime()
    const delta = now - start
    if (delta >= amount) {
      deferred.resolve()
    } else {
      const [np, ncancel] = cancellableWait(amount - delta)
      lastCancel = ncancel
      np.then(resolve, reject)
    }
  }
  p.then(resolve, reject)
  return [deferred.promise, () => {
    lastCancel()
  }]
}
