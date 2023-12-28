
import asyncSleepPreciseCancellable from './asyncSleepPreciseCancellable.mjs'

/**
 * Waits a given amount of time.
 *
 * This function is similar to `asyncSleep()` except it ensures that the amount of time measured
 * using the `Date` object is always greater than or equal the asked amount of time.
 *
 * This function can imply additional delay that can be bad for performances. As such it is
 * recommended to only use it in unit tests or very specific cases. Most applications should
 * be adapted to work with the usual `setTimout()` inconsistencies even if it can trigger some
 * milliseconds before the asked delay.
 *
 * @param {number} amount An amount of time in milliseconds
 * @returns {Promise<void>} A promise that will be resolved after the given amount of time has passed.
 * @example
 * import { asyncSleepPrecise } from 'modern-async'
 *
 * await asyncSleepPrecise(100) // will wait 100ms
 */
async function asyncSleepPrecise (amount) {
  return asyncSleepPreciseCancellable(amount)[0]
}

export default asyncSleepPrecise
