
import Queue from './Queue.mjs'
import asyncIterableToArray from './asyncIterableToArray.mjs'
import asyncGeneratorFilter from './asyncGeneratorFilter.mjs'

/**
 * Returns an array of all the values in `iterable` which pass an asynchronous truth test.
 *
 * The calls to `iteratee` will be performed in a queue to limit the concurrency of these calls.
 * The results will be in the same order than in `iterable`.
 *
 * If any of the calls to `iteratee` throws an exception the returned promise will be rejected and the remaining
 * pending tasks will be cancelled.
 *
 * @param {Iterable | AsyncIterable} iterable An iterable or async iterable object.
 * @param {Function} iteratee A function that will be called with each member of `iterable`. It will receive
 * three arguments:
 *   * `value`: The current value to process
 *   * `index`: The index in the iterable. Will start from 0.
 *   * `iterable`: The iterable on which the operation is being performed.
 * @param {Queue | number} [queueOrConcurrency] If a queue is specified it will be used to schedule the calls to
 * `iteratee`. If a number is specified it will be used as the concurrency of a Queue that will be created
 * implicitly for the same purpose. Defaults to `1`.
 * @returns {Promise<any[]>} A promise that will be resolved with an array containing all the values that passed
 * the truth test. This promise will be rejected if any of the `iteratee` calls throws an exception.
 * @example
 * // example using the default concurrency of 1
 * import { asyncFilter, asyncSleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 * const result = await asyncFilter(array, async (v) => {
 *   // these calls will be performed sequentially
 *   await asyncSleep(10) // waits 10ms
 *   return v % 2 === 1
 * })
 * console.log(result) // prints [1, 3]
 * // total processing time should be ~ 30ms
 * @example
 * // example using a set concurrency
 * import { asyncFilter, asyncSleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 * const result = await asyncFilter(array, async (v) => {
 *   // these calls will be performed in parallel with a maximum of 2
 *   // concurrent calls
 *   await asyncSleep(10) // waits 10ms
 *   return v % 2 === 1
 * }, 2)
 * console.log(result) // prints [1, 3]
 * // total processing time should be ~ 20ms
 * @example
 * // example using infinite concurrency
 * import { asyncFilter, asyncSleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 * const result = await asyncFilter(array, async (v) => {
 *   // these calls will be performed in parallel
 *   await asyncSleep(10) // waits 10ms
 *   return v % 2 === 1
 * }, Number.POSITIVE_INFINITY)
 * console.log(result) // prints [1, 3]
 * // total processing time should be ~ 10ms
 */
async function asyncFilter (iterable, iteratee, queueOrConcurrency = 1) {
  return await asyncIterableToArray(asyncGeneratorFilter(iterable, iteratee, queueOrConcurrency))
}

export default asyncFilter
