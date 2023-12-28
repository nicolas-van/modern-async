
import asyncSleepCancellable from './asyncSleepCancellable.mjs'

/**
 * Waits a given amount of time.
 *
 * This function uses `setTimeout()` internally and has the same behavior, notably that it could resolve
 * after the asked time (depending on other tasks running in the event loop) or a few milliseconds before.
 *
 * @param {number} amount An amount of time in milliseconds
 * @returns {Promise<void>} A promise that will be resolved after the given amount of time has passed.
 * @example
 * import { asyncSleep } from 'modern-async'
 *
 * await asyncSleep(100) // will wait 100ms
 * @example
 * // another example that doesn't block on the asyncSleep call
 * // it's functionally identical to using setTimout but with a promise syntax
 * import { asyncSleep } from 'modern-async'
 *
 * asyncSleep(10).then(() => {
 *   console.log('hello')
 * })
 * // will print 'hello' after 10ms
 */
async function asyncSleep (amount) {
  return asyncSleepCancellable(amount)[0]
}

export default asyncSleep
