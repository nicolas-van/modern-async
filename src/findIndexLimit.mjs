
import findInternal from './findInternal.mjs'
import Queue from './Queue.mjs'

/**
 * Returns the index of the first element of an iterable that passes an asynchronous truth test.
 *
 * The calls to `iteratee` will run in parallel, up to a concurrency limit.
 *
 * Whenever a result is found, all the remaining tasks will be cancelled as long
 * as they didn't started already. In case of exception in one of the iteratee calls the promise
 * returned by this function will be rejected with the exception and the remaining pending
 * tasks will also be cancelled. In the very specific case where a result is found and an
 * already started task throws an exception that exception will be plainly ignored.
 *
 * @param {Iterable | AsyncIterable} iterable An iterable or async iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable. It will receive
 * three arguments:
 *   * `value`: The current value to process
 *   * `index`: The index in the iterable. Will start from 0.
 *   * `iterable`: The iterable on which the operation is being performed.
 * @param {number | Queue} concurrencyOrQueue The maximum number of times iteratee can be called concurrently or
 * a queue.
 * @param {boolean} ordered Defaults to true. If true this function will return on the first element in the iterable
 * order for which `iteratee` returned true. If false it will be the first in time.
 * @returns {Promise} A promise that will be resolved with the index of the first found value or rejected if one of the
 * `iteratee` calls throws an exception before finding a value. If no value is found it will return `-1`.
 * @example
 * import { findIndexLimit, asyncRoot, sleep } from 'modern-async'
 *
 * asyncRoot(async () => {
 *   const array = [1, 2, 3, 4, 5]
 *   const result = await findIndexLimit(array, async (v) => {
 *     // these calls will be performed in parallel with a maximum of 3
 *     // concurrent calls
 *     await sleep(Math.random() * 10) // waits a random amount of time between 0ms and 10ms
 *     return v % 2 === 1
 *   }, 3)
 *   console.log(result) // prints 0
 * })
 */
async function findIndexLimit (iterable, iteratee, concurrencyOrQueue, ordered = true) {
  const result = (await findInternal(iterable, iteratee, concurrencyOrQueue, ordered))[0]
  return result
}

export default findIndexLimit
