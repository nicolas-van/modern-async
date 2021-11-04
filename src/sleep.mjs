
import sleepCancellable from './sleepCancellable.mjs'

/**
 * Waits a given amount of time.
 *
 * This function uses `setTimeout()` internally and has the same behavior, notably that it could resolve
 * after the asked time (depending on other tasks running in the event loop) or a few milliseconds before.
 *
 * @param {number} amount An amount of time in milliseconds
 * @returns {Promise<void>} A promise that will be resolved after the given amount of time has passed.
 * @example
 * import { sleep } from 'modern-async'
 *
 * await sleep(100) // will wait 100ms
 * @example
 * // another example that doesn't block on the sleep call
 * // it's functionally identical to using setTimout but with a promise syntax
 * import { sleep } from 'modern-async'
 *
 * sleep(10).then(() => {
 *   console.log('hello')
 * })
 * // will print 'hello' after 10ms
 */
async function sleep (amount) {
  return sleepCancellable(amount)[0]
}

export default sleep
