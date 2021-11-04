
import filterLimit from './filterLimit.mjs'

/**
 * Returns an array of all the values in `iterable` which pass an asynchronous truth test.
 *
 * The calls to `iteratee` will perform sequentially. The results will be in the same order than in `iterable`.
 *
 * If any of the calls to `iteratee` throws an exception the returned promise will be rejected and the remaining
 * pending tasks will be cancelled.
 *
 * @param {Iterable | AsyncIterable} iterable An iterable or async iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable. It will receive
 * three arguments:
 *   * `value`: The current value to process
 *   * `index`: The index in the iterable. Will start from 0.
 *   * `iterable`: The iterable on which the operation is being performed.
 * @returns {Promise<any[]>} A promise that will be resolved with an array containing all the values that passed
 * the truth test. This promise will be rejected if any of the `iteratee` calls throws an exception.
 * @example
 * import { filterSeries, sleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 * const result = await filterSeries(array, async (v) => {
 *   // these calls will be performed sequentially
 *   await sleep(10) // waits 10ms
 *   return v % 2 === 1
 * })
 * console.log(result) // prints [1, 3]
 * // total processing time should be ~ 30ms
 * })
 */
async function filterSeries (iterable, iteratee) {
  return filterLimit(iterable, iteratee, 1)
}

export default filterSeries
