
import cancellableWait from './cancellableWait'

/**
 * Waits a given amount of time.
 *
 * @param {number} amount An amount of time in milliseconds
 * @returns {Promise} A promise that will be resolved after the given amount of time has passed.
 */
export default async function wait (amount) {
  return cancellableWait(amount)[0]
}
