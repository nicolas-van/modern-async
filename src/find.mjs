
import findLimit from './findLimit.mjs'

/**
 * Returns the first element of an iterable that passes an asynchronous truth test.
 *
 * The calls to `iteratee` will run in parallel. Regardless of which function
 * call returns first, this function will always return the first in iterable order able to pass the truth
 * test. Concurrency has no impact on the value that will be returned by this function.
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
 * @returns {Promise} A promise that will be resolved with the first found value or rejected if one of the
 * `iteratee` calls throws an exception before finding a value. If no value is found it will return `undefined`.
 * @example
 * import { find, asyncRoot, sleep } from 'modern-async'
 *
 * asyncRoot(async () => {
 *   const array = [1, 2, 3]
 *   const result = await find(array, async (v) => {
 *     // these calls will be performed in parallel
 *     await sleep(Math.random() * 10) // waits a random amount of time between 0ms and 10ms
 *     return v % 2 === 1
 *   })
 *   console.log(result) // will always print 1
 * })
 */
async function find (iterable, iteratee) {
  return findLimit(iterable, iteratee, Number.POSITIVE_INFINITY)
}

export default find
