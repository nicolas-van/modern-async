
import waitCancellable from './waitCancellable'
import TimeoutError from './TimeoutError'
import asyncWrap from './asyncWrap'
import Deferred from './Deferred'

/**
 * Wraps a call to an asynchronous function to add a timer on it. If the delay is exceeded
 * the returned promise will be rejected with a TimeoutError.
 *
 * @param {Function} fct An asynchronous function that will be called immediately without arguments.
 * @param {number} amount An amount of time in milliseconds
 * @returns {Promise} A promise that will be resolved or rejected according to the result of the call
 * to fct. If amount milliseconds pass before the call to fct returns or rejects, this promise will
 * be rejected with a TimeoutError.
 */
export default async function timeout (fct, amount) {
  const asyncFct = asyncWrap(fct)

  const [timoutPromise, cancelTimeout] = waitCancellable(amount)

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
