
import mapLimit from './mapLimit'

/**
 * Produces a new collection of values by mapping each value in iterable through the iteratee function.
 * Multiple calls to iteratee will be performed in parallel.
 *
 * @param {Iterable} iterable An iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable. It will receive
 * three arguments:
 *   * value: The current value to process
 *   * index: The index in the iterable. Will start from 0.
 *   * iterable: The iterable on which the operation is being performed.
 * @returns {Promise} A promise that will be resolved with an Array containing all the mapped value,
 * or will be rejected if any of the calls to iteratee throws an exception.
 * @example
 * import { map, asyncRoot, wait } from 'modern-async'
 *
 * asyncRoot(async () => {
 *   const array = [1, 2, 3]
 *   const result = await map(array, async (v) => {
 *     // these calls will be performed in parallel
 *     await wait(10) // waits 10ms
 *     return v * 2
 *   })
 *   console.log(result) // prints [2, 4, 6]
 *   // total processing time should be ~ 10ms
 * })
 */
async function map (iterable, iteratee) {
  return mapLimit(iterable, iteratee, Number.POSITIVE_INFINITY)
}

export default map
