
import Queue from './Queue.mjs'
import asyncFromEntries from './asyncFromEntries.mjs'
import asyncGeneratorFilter from './asyncGeneratorFilter.mjs'
import generatorEntries from './generatorEntries.mjs'
import asyncWrap from './asyncWrap.mjs'

/**
 * Returns a new object with all the key-value pairs of `obj` which pass an asynchronous truth test.
 *
 * The calls to `iteratee` will be performed asynchronously in a {@link Queue}, allowing control over the concurrency of those calls.
 * The results will be in the same order than in `obj`.
 *
 * If any of the calls to `iteratee` throws an exception the returned promise will be rejected and the remaining
 * pending tasks will be cancelled.
 *
 * @param {object} obj The object to iterate over key-value pairs.
 * @param {Function} iteratee A function that will be called with each key-value pair of the object. It will receive
 * three arguments:
 *   * `value`: The current value to process
 *   * `key`: The current key to process
 *   * `obj`: The object on which the operation is being performed.
 * @param {Queue | number} [queueOrConcurrency] If a {@link Queue} is specified it will be used to schedule the calls to
 * `iteratee`. If a number is specified it will be used as the concurrency of a {@link Queue} that will be created
 * implicitly for the same purpose. Defaults to `1`.
 * @returns {Promise<object>} A promise that will be resolved with a new object containing all the key-value pairs
 * that passed the truth test. This promise will be rejected if any of the `iteratee` calls throws an exception.
 * @see {@link asyncFilter} to filter an iterable
 * @example
 * // example using the default concurrency of 1
 * import { asyncFilterObject, asyncSleep } from 'modern-async'
 *
 * const obj = {a: 1, b: 2, c: 3}
 * const result = await asyncFilterObject(obj, async (v) => {
 *   // these calls will be performed sequentially
 *   await asyncSleep(10) // waits 10ms
 *   return v % 2 === 1
 * })
 * console.log(result) // prints Object { a: 1, c: 3 }
 * // total processing time should be ~ 30ms
 * @example
 * // example using a set concurrency
 * import { asyncFilterObject, asyncSleep } from 'modern-async'
 *
 * const obj = {a: 1, b: 2, c: 3}
 * const result = await asyncFilterObject(obj, async (v) => {
 *   // these calls will be performed in parallel with a maximum of 2
 *   // concurrent calls
 *   await asyncSleep(10) // waits 10ms
 *   return v % 2 === 1
 * }, 2)
 * console.log(result) // prints Object { a: 1, c: 3 }
 * // total processing time should be ~ 20ms
 * @example
 * // example using infinite concurrency
 * import { asyncFilterObject, asyncSleep } from 'modern-async'
 *
 * const obj = {a: 1, b: 2, c: 3}
 * const result = await asyncFilterObject(obj, async (v) => {
 *   // these calls will be performed in parallel
 *   await asyncSleep(10) // waits 10ms
 *   return v % 2 === 1
 * }, Number.POSITIVE_INFINITY)
 * console.log(result) // prints Object { a: 1, c: 3 }
 * // total processing time should be ~ 10ms
 */
async function asyncFilterObject (obj, iteratee, queueOrConcurrency = 1) {
  iteratee = asyncWrap(iteratee)
  return await asyncFromEntries(asyncGeneratorFilter(generatorEntries(obj), async ([k, v]) => {
    return await iteratee(v, k, obj)
  }, queueOrConcurrency))
}

export default asyncFilterObject
