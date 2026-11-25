import asyncMap from './asyncMap.mjs'
import Queue from './Queue.mjs'

/**
 * Produces a new array of values by mapping each value in `iterable` through the `iteratee` function,
 * then flattening the result by one level.
 *
 * This is the asynchronous counterpart of `Array.prototype.flatMap()`: it is equivalent to
 * `(await asyncMap(...)).flat(1)`. Each value returned by `iteratee` is appended to the result as-is,
 * except when it is an array, in which case its elements are appended individually. Nested arrays are
 * therefore flattened by one level only.
 *
 * The calls to `iteratee` will be performed asynchronously in a {@link Queue}, allowing control over the concurrency of those calls.
 * The results will be in the same order than in `iterable`.
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
 *
 * It may return an array of values that will be flattened by one level in the resulting array. Any other
 * returned value will be appended as-is.
 * @param {Queue | number} [queueOrConcurrency] If a {@link Queue} is specified it will be used to schedule the calls to
 * `iteratee`. If a number is specified it will be used as the concurrency of a {@link Queue} that will be created
 * implicitly for the same purpose. Defaults to `1`.
 * @returns {Promise<any[]>} A promise that will be resolved with an array containing all the mapped values,
 * flattened by one level, or will be rejected if any of the calls to `iteratee` throws an exception.
 * @see {@link asyncMap} to map values without flattening the result
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap Array.prototype.flatMap()}
 * @example
 * // example using the default concurrency of 1
 * import { asyncFlatMap, asyncSleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 * const result = await asyncFlatMap(array, async (v) => {
 *   // these calls will be performed sequentially
 *   await asyncSleep(10) // waits 10ms
 *   return [v, v * 2]
 * })
 * console.log(result) // prints [1, 2, 2, 4, 3, 6]
 * // total processing time should be ~ 30ms
 * @example
 * // example using a set concurrency
 * import { asyncFlatMap, asyncSleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 * const result = await asyncFlatMap(array, async (v) => {
 *   // these calls will be performed in parallel with a maximum of 2
 *   // concurrent calls
 *   await asyncSleep(10) // waits 10ms
 *   return [v, v * 2]
 * }, 2)
 * console.log(result) // prints [1, 2, 2, 4, 3, 6]
 * // total processing time should be ~ 20ms
 * @example
 * // example using infinite concurrency
 * import { asyncFlatMap, asyncSleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 * const result = await asyncFlatMap(array, async (v) => {
 *   // these calls will be performed in parallel
 *   await asyncSleep(10) // waits 10ms
 *   return [v, v * 2]
 * }, Number.POSITIVE_INFINITY)
 * console.log(result) // prints [1, 2, 2, 4, 3, 6]
 * // total processing time should be ~ 10ms
 */
async function asyncFlatMap (iterable, iteratee, queueOrConcurrency = 1) {
  return (await asyncMap(iterable, iteratee, queueOrConcurrency)).flat(1)
}

export default asyncFlatMap
