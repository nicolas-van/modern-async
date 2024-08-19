
import Queue from './Queue.mjs'
import generatorEntries from './generatorEntries.mjs'
import asyncFromEntries from './asyncFromEntries.mjs'
import asyncGeneratorMap from './asyncGeneratorMap.mjs'
import asyncWrap from './asyncWrap.mjs'

/**
 * Maps the key-value pairs found in an object by calling the `iteratee`
 * function, returning a new key-value pair, and re-construct a new object with the new
 * key-value pairs.
 *
 * The calls to `iteratee` will be performed in a queue to limit the concurrency of these calls.
 *
 * If any of the calls to iteratee throws an exception the returned promise will be rejected and the remaining
 * pending tasks will be cancelled.
 *
 * @param {object} obj The object to iterate over values.
 * @param {Function} iteratee A function that will be called with each key-value pair of the object. It will receive
 * three arguments:
 *   * `value`: The current value to process
 *   * `key`: The current key to process
 *   * `obj`: The object on which the operation is being performed.
 *
 * That function must return a tuple containing two objects:
 *   * The mapped key.
 *   * The mapped value.
 * @param {Queue | number} [queueOrConcurrency] If a queue is specified it will be used to schedule the calls to
 * `iteratee`. If a number is specified it will be used as the concurrency of a Queue that will be created
 * implicitly for the same purpose. Defaults to `1`.
 * @returns {Promise<object>} A promise that will be resolved with a new object built with the
 * key-value pairs returned by `iteratee`.
 * @example
 * // example using the default concurrency of 1
 * import { asyncMapEntries, asyncSleep } from 'modern-async'
 *
 * const obj = {a: 1, b: 2, c: 3}
 * const result = await asyncMapEntries(obj, async (v, k) => {
 *   // these calls will be performed sequentially
 *   await asyncSleep(10) // waits 10ms
 *   return [k + 'x', v * 2]
 * })
 * console.log(result) // prints Object { ax: 2, bx: 4, cx: 6 }
 * // total processing time should be ~ 30ms
 * @example
 * // example using a set concurrency
 * import { asyncMapEntries, asyncSleep } from 'modern-async'
 *
 * const obj = {a: 1, b: 2, c: 3}
 * const result = await asyncMapEntries(obj, async (v, k) => {
 *   // these calls will be performed in parallel with a maximum of 2
 *   // concurrent calls
 *   await asyncSleep(10) // waits 10ms
 *   return [k + 'x', v * 2]
 * }, 2)
 * console.log(result) // prints Object { ax: 2, bx: 4, cx: 6 }
 * // total processing time should be ~ 20ms
 * @example
 * // example using infinite concurrency
 * import { asyncMap, asyncSleep } from 'modern-async'
 *
 * const obj = {a: 1, b: 2, c: 3}
 * const result = await asyncMapEntries(obj, async (v, k) => {
 *   // these calls will be performed in parallel with a maximum of 2
 *   // concurrent calls
 *   await asyncSleep(10) // waits 10ms
 *   return [k + 'x', v * 2]
 * }, Number.POSITIVE_INFINITY)
 * console.log(result) // prints Object { ax: 2, bx: 4, cx: 6 }
 * // total processing time should be ~ 10ms
 */
async function asyncMapEntries (obj, iteratee, queueOrConcurrency = 1) {
  iteratee = asyncWrap(iteratee)
  return await asyncFromEntries(asyncGeneratorMap(generatorEntries(obj), async ([k, v]) => {
    const [nk, nv] = await iteratee(v, k, obj)
    return [nk, nv]
  }, queueOrConcurrency))
}

export default asyncMapEntries
