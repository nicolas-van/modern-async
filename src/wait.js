
import cancellableWait from './cancellableWait'

/**
 * Waits a given amount of time. This function uses setTimeout() internally and has the same
 * behavior, notably that it could resolve after the asked time (depending on other tasks running)
 * or a few milliseconds before.
 *
 * @param {number} amount An amount of time in milliseconds
 * @returns {Promise} A promise that will be resolved after the given amount of time has passed.
 */
export default async function wait (amount) {
  return cancellableWait(amount)[0]
}
