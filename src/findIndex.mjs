
import findIndexLimit from './findIndexLimit.mjs'

/**
 * Returns the index of the first element of an iterable that passes an asynchronous truth test.
 *
 * The calls to `iteratee` will run in parallel.
 *
 * In case of exception in one of the `iteratee` calls the promise returned by this function will be
 * rejected with the exception. In the very specific case where a result is found and an
 * already started task throws an exception that exception will be plainly ignored.
 *
 * @param {Iterable | AsyncIterable} iterable An iterable or async iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable. It will receive
 * three arguments:
 *   * `value`: The current value to process
 *   * `index`: The index in the iterable. Will start from 0.
 *   * `iterable`: The iterable on which the operation is being performed.
 * @param {boolean} [ordered] If true this function will return on the first element in the iterable
 * order for which `iteratee` returned true. If false it will be the first in time.
 * @returns {Promise<number>} A promise that will be resolved with the index of the first found value or rejected if one of the
 * `iteratee` calls throws an exception before finding a value. If no value is found it will return `-1`.
 * @example
 * import { findIndex, sleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 * const result = await findIndex(array, async (v) => {
 *   // these calls will be performed in parallel
 *   await sleep(Math.random() * 10) // waits a random amount of time between 0ms and 10ms
 *   return v % 2 === 1
 * })
 * console.log(result) // prints 0
 */
async function findIndex (iterable, iteratee, ordered = false) {
  return findIndexLimit(iterable, iteratee, Number.POSITIVE_INFINITY, ordered)
}

export default findIndex
