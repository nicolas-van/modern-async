
import sleepCancellable from './sleepCancellable'

/**
 * Waits a given amount of time.
 *
 * This function uses setTimeout() internally and has the same behavior, notably that it could resolve
 * after the asked time (depending on other tasks running in the event loop) or a few milliseconds before.
 *
 * @param {number} amount An amount of time in milliseconds
 * @returns {Promise} A promise that will be resolved after the given amount of time has passed.
 */
async function sleep (amount) {
  return sleepCancellable(amount)[0]
}

export default sleep
