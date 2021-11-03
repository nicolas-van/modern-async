
import forEachLimit from './forEachLimit.mjs'

/**
 * Calls a function on each element of iterable.
 *
 * Multiple calls to `iteratee` will be performed sequentially.
 *
 * If any of the calls to iteratee throws an exception the returned promise will be rejected and the remaining
 * pending tasks will be cancelled.
 *
 * @param {Iterable | AsyncIterable} iterable An iterable or async iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable. It will receive
 * three arguments:
 *   * `value`: The current value to process
 *   * `index`: The index in the iterable. Will start from 0.
 *   * `iterable`: The iterable on which the operation is being performed.
 * @returns {Promise} A promise that will be resolved when all the calls to `iteratee` have been done.
 * This promise will be rejected if any call to `iteratee` throws an exception.
 * @example
 * import { forEachSeries, sleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 * await forEachSeries(array, async (v) => {
 *   // these calls will be performed sequentially
 *   await sleep(Math.random() * 10) // waits a random amount of time between 0ms and 10ms
 *   console.log(v)
 * })
 * // prints 1, 2 and 3 in that exact order
 */
async function forEachSeries (iterable, iteratee) {
  return forEachLimit(iterable, iteratee, 1)
}

export default forEachSeries
