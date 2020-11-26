
import waitPreciseCancellable from './waitPreciseCancellable'

/**
 * Waits a given amount of time. This function is similar to wait()
 * except it ensures that the amount of time measured using the Date object is
 * always greater than or equal the asked amount of time.
 *
 * @param {number} amount An amount of time in milliseconds
 * @returns {Promise} A promise that will be resolved after the given amount of time has passed.
 */
export default async function waitPrecise (amount) {
  return waitPreciseCancellable(amount)[0]
}
