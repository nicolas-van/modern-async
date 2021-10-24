
import Queue from './Queue.mjs'
import toArray from './toArray.mjs'
import filterGenerator from './filterGenerator.mjs'

/**
 * Returns a new array of all the values in iterable which pass an asynchronous truth test.
 *
 * The calls to `iteratee` will perform in parallel, up to the concurrency limit, but the results array will be
 * in the same order than the original.
 *
 * If any of the calls to iteratee throws an exception the returned promise will be rejected and the remaining
 * pending tasks will be cancelled.
 *
 * @param {Iterable | AsyncIterable} iterable An iterable or async iterable object.
 * @param {Function} iteratee A function that will be called with each member of `iterable`. It will receive
 * three arguments:
 *   * `value`: The current value to process
 *   * `index`: The index in the iterable. Will start from 0.
 *   * `iterable`: The iterable on which the operation is being performed.
 * @param {number | Queue} concurrencyOrQueue The maximum number of times iteratee can be called concurrently or
 * a queue.
 * @returns {Promise} A promise that will be resolved with an array containing all the values that passed
 * the truth test. This promise will be rejected if any of the `iteratee` calls throws an exception.
 * @example
 * import { filterLimit, asyncRoot, sleep } from 'modern-async'
 *
 * asyncRoot(async () => {
 *   const array = [1, 2, 3]
 *   const result = await filterLimit(array, async (v) => {
 *     // these calls will be performed in parallel with a maximum of 2
 *     // concurrent calls
 *     await sleep(10) // waits 10ms
 *     return v % 2 === 1
 *   }, 2)
 *   console.log(result) // prints [1, 3]
 *   // total processing time should be ~ 20ms
 * })
 */
async function filterLimit (iterable, iteratee, concurrencyOrQueue) {
  return await toArray(filterGenerator(iterable, iteratee, concurrencyOrQueue))
}

export default filterLimit
