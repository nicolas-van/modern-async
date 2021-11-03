
import sleepCancellable from './sleepCancellable.mjs'
import TimeoutError from './TimeoutError.mjs'
import asyncWrap from './asyncWrap.mjs'
import Deferred from './Deferred.mjs'

/**
 * Wraps a call to an asynchronous function to add a timer on it. If the delay is exceeded
 * the returned promise will be rejected with a `TimeoutError`.
 *
 * This function uses `setTimeout()` internally and has the same behavior, notably that it could reject
 * after the asked time (depending on other tasks running in the event loop) or a few milliseconds before.
 *
 * @param {Function} fct An asynchronous function that will be called immediately without arguments.
 * @param {number} amount An amount of time in milliseconds
 * @returns {Promise} A promise that will be resolved or rejected according to the result of the call
 * to `fct`. If `amount` milliseconds pass before the call to `fct` returns or rejects, this promise will
 * be rejected with a `TimeoutError`.
 * @example
 * import { timeout, sleep } from 'modern-async'
 *
 * // the following statement will perform successfully because
 * // the function will return before the delay
 * await timeout(async () => {
 *   await sleep(10)
 * }, 100)
 *
 * try {
 *   // the following statement will throw after 10ms
 *   await timeout(async () => {
 *     await sleep(100)
 *   }, 10)
 * } catch (e) {
 *   console.log(e.name) // prints TimeoutError
 * }
 */
async function timeout (fct, amount) {
  const asyncFct = asyncWrap(fct)

  const [timoutPromise, cancelTimeout] = sleepCancellable(amount)

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

export default timeout
