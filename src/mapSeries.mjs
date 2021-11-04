
import mapLimit from './mapLimit.mjs'

/**
 * Produces a new collection of values by mapping each value in `iterable` through the `iteratee` function.
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
 * @returns {Promise<any[]>} A promise that will be resolved with an array containing all the mapped value,
 * or will be rejected if any of the calls to `iteratee` throws an exception.
 * @example
 * import { mapSeries, sleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 * const result = await mapSeries(array, async (v) => {
 *   // these calls will be performed sequentially
 *   await sleep(10) // waits 10ms
 *   return v * 2
 * }, 2)
 * console.log(result) // prints [2, 4, 6]
 * // total processing time should be ~ 30ms
 */
async function mapSeries (iterable, iteratee) {
  return mapLimit(iterable, iteratee, 1)
}

export default mapSeries
