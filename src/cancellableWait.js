
import assert from 'assert'
import CancelledError from './CancelledError'

/**
 * Waits a given amount of time. This function returns both a promise and cancel function in
 * order to cancel the wait time if necessary. If cancelled, the promise will be rejected
 * with a CancelError.
 *
 * @param {number} amount An amount of time in milliseconds
 * @returns {Array} A tuple of two objects:
 *   * The promise
 *   * The cancel function
 */
export default function cancellableWait (amount) {
  assert(typeof amount === 'number')
  let id
  let rejectTmp
  const promise = new Promise((resolve, reject) => {
    rejectTmp = reject
    id = setTimeout(resolve, amount)
  })
  return [promise, () => {
    rejectTmp(new CancelledError())
    clearTimeout(id)
  }]
}
