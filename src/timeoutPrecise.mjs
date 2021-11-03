
import sleepPreciseCancellable from './sleepPreciseCancellable.mjs'
import TimeoutError from './TimeoutError.mjs'
import asyncWrap from './asyncWrap.mjs'
import Deferred from './Deferred.mjs'

/**
 * Wraps a call to an asynchronous function to add a timer on it. If the delay is exceeded
 * the returned promise will be rejected with a `TimeoutError`.
 *
 * This function is similar to `timeout()` except it ensures that the amount of time measured
 * using the `Date` object is always greater than or equal the asked amount of time.
 *
 * This function can imply additional delay that can be bad for performances. As such it is
 * recommended to only use it in unit tests or very specific cases. Most applications should
 * be adapted to work with the usual `setTimout()` inconsistencies even if it can trigger some
 * milliseconds before the asked delay.
 *
 * @param {Function} fct An asynchronous function that will be called immediately without arguments.
 * @param {number} amount An amount of time in milliseconds
 * @returns {Promise} A promise that will be resolved or rejected according to the result of the call
 * to `fct`. If `amount` milliseconds pass before the call to `fct` returns or rejects, this promise will
 * be rejected with a `TimeoutError`.
 * @example
 * import { timeoutPrecise, sleep } from 'modern-async'
 *
 * // the following statement will perform successfully because
 * // the function will return before the delay
 * await timeoutPrecise(async () => {
 *   await sleep(10)
 * }, 100)
 *
 * try {
 *   // the following statement will throw after 10ms
 *   await timeoutPrecise(async () => {
 *     await sleep(100)
 *   }, 10)
 * } catch (e) {
 *   console.log(e.name) // prints TimeoutError
 * }
 */
async function timeoutPrecise (fct, amount) {
  const asyncFct = asyncWrap(fct)

  const [timoutPromise, cancelTimeout] = sleepPreciseCancellable(amount)

  const basePromise = asyncFct()

  const deferred = new Deferred()

  basePromise.then(deferred.resolve, deferred.reject)

  timoutPromise.then(() => {
    deferred.reject(new TimeoutError())
  }, () => {
    // ignore CancelledError
  })

  return deferred.promise.finally(cancelTimeout)
}

export default timeoutPrecise
