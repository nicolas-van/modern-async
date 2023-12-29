
import asyncFindInternal from './asyncFindInternal.mjs'
import Queue from './Queue.mjs'

/**
 * Returns the index of the first element of an iterable that passes an asynchronous truth test.
 *
 * The calls to `iteratee` will be performed in a queue to limit the concurrency of these calls.
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
 * @param {Queue | number} [queueOrConcurrency] If a queue is specified it will be used to schedule the calls to
 * `iteratee`. If a number is specified it will be used as the concurrency of a Queue that will be created
 * implicitly for the same purpose. Defaults to `1`.
 * @param {boolean} [ordered] If true this function will return on the first element in the iterable
 * order for which `iteratee` returned true. If false it will be the first in time.
 * @returns {Promise<number>} A promise that will be resolved with the index of the first found value or rejected if one of the
 * `iteratee` calls throws an exception before finding a value. If no value is found it will return `-1`.
 * @example
 * // example using the default concurrency of 1
 * import { asyncFindIndex, asyncSleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 * const result = await asyncFindIndex(array, async (v) => {
 *   // these calls will be performed sequentially
 *   await asyncSleep(Math.random() * 10) // waits a random amount of time between 0ms and 10ms
 *   return v % 2 === 1
 * })
 * console.log(result) // prints 0
 * @example
 * // example using a set concurrency
 * import { asyncFindIndex, asyncSleep } from 'modern-async'
 *
 * const array = [1, 2, 3, 4, 5]
 * const result = await asyncFindIndex(array, async (v) => {
 *   // these calls will be performed in parallel with a maximum of 3
 *   // concurrent calls
 *   await asyncSleep(Math.random() * 10) // waits a random amount of time between 0ms and 10ms
 *   return v % 2 === 1
 * }, 3)
 * console.log(result) // prints 0 or 2, randomly
 * @example
 * // example using infinite concurrency
 * import { asyncFindIndex, asyncSleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 * const result = await asyncFindIndex(array, async (v) => {
 *   // these calls will be performed in parallel
 *   await asyncSleep(Math.random() * 10) // waits a random amount of time between 0ms and 10ms
 *   return v % 2 === 1
 * }, Number.POSITIVE_INFINITY)
 * console.log(result) // prints 0 or 2, randomly
 */
async function asyncFindIndex (iterable, iteratee, queueOrConcurrency = 1, ordered = false) {
  const result = (await asyncFindInternal(iterable, iteratee, queueOrConcurrency, ordered))[0]
  return result
}

export default asyncFindIndex
