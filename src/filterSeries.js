
import filterLimit from './filterLimit'

/**
 * Returns a new array of all the values in iterable which pass an asynchronous truth test.
 *
 * The calls to `iteratee` will perform sequentially and the results array will be in the same order
 * than the original.
 *
 * @param {Iterable} iterable An iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable. It will receive
 * three arguments:
 *   * `value`: The current value to process
 *   * `index`: The index in the iterable. Will start from 0.
 *   * `iterable`: The iterable on which the operation is being performed.
 * @returns {Promise} A promise that will be resolved with an array containing all the values that passed
 * the truth test. This promise will be rejected if any of the `iteratee` calls throws an exception.
 * @example
 * import { filterSeries, asyncRoot, sleep } from 'modern-async'
 *
 * asyncRoot(async () => {
 *   const array = [1, 2, 3]
 *   const result = await filterSeries(array, async (v) => {
 *     // these calls will be performed sequentially
 *     await sleep(10) // waits 10ms
 *     return v % 2 === 1
 *   })
 *   console.log(result) // prints [1, 3]
 *   // total processing time should be ~ 30ms
 * })
 */
async function filterSeries (iterable, iteratee) {
  return filterLimit(iterable, iteratee, 1)
}

export default filterSeries
