
import Queue from './Queue.mjs'
import asyncMapEntries from './asyncMapEntries.mjs'
import asyncWrap from './asyncWrap.mjs'

/**
 * Maps the keys found in an object by calling the `iteratee`
 * function, returning a new key, and re-construct a new object with the new keys.
 *
 * The calls to `iteratee` will be performed asynchronously in a {@link Queue}, allowing control over the concurrency of those calls.
 *
 * If any of the calls to iteratee throws an exception the returned promise will be rejected and the remaining
 * pending tasks will be cancelled.
 *
 * @param {object} obj The object to iterate over keys.
 * @param {Function} iteratee A function that will be called with each key-value pair of the object. It will receive
 * three arguments:
 *   * `value`: The current value to process
 *   * `key`: The current key to process
 *   * `obj`: The object on which the operation is being performed.
 * @param {Queue | number} [queueOrConcurrency] If a {@link Queue} is specified it will be used to schedule the calls to
 * `iteratee`. If a number is specified it will be used as the concurrency of a {@link Queue} that will be created
 * implicitly for the same purpose. Defaults to `1`.
 * @returns {Promise<object>} A promise that will be resolved with a new object built with the
 * new keys returned by `iteratee`.
 * @see {@link asyncMapValues} to map values of an object
 * @see {@link asyncMapEntries} to map both keys and values of an object simultaneously
 * @example
 * // example using the default concurrency of 1
 * import { asyncMapKeys, asyncSleep } from 'modern-async'
 *
 * const obj = {a: 1, b: 2, c: 3}
 * const result = await asyncMapKeys(obj, async (v, k) => {
 *   // these calls will be performed sequentially
 *   await asyncSleep(10) // waits 10ms
 *   return k + 'x'
 * })
 * console.log(result) // prints Object { ax: 1, bx: 2, cx: 3 }
 * // total processing time should be ~ 30ms
 * @example
 * // example using a set concurrency
 * import { asyncMapKeys, asyncSleep } from 'modern-async'
 *
 * const obj = {a: 1, b: 2, c: 3}
 * const result = await asyncMapKeys(obj, async (v, k) => {
 *   // these calls will be performed in parallel with a maximum of 2
 *   // concurrent calls
 *   await asyncSleep(10) // waits 10ms
 *   return k + 'x'
 * }, 2)
 * console.log(result) // prints Object { ax: 1, bx: 2, cx: 3 }
 * // total processing time should be ~ 20ms
 * @example
 * // example using infinite concurrency
 * import { asyncMapKeys, asyncSleep } from 'modern-async'
 *
 * const obj = {a: 1, b: 2, c: 3}
 * const result = await asyncMapKeys(obj, async (v, k) => {
 *   // these calls will be performed in parallel with a maximum of 2
 *   // concurrent calls
 *   await asyncSleep(10) // waits 10ms
 *   return k + 'x'
 * }, Number.POSITIVE_INFINITY)
 * console.log(result) // prints Object { ax: 1, bx: 2, cx: 3 }
 * // total processing time should be ~ 10ms
 */
async function asyncMapKeys (obj, iteratee, queueOrConcurrency = 1) {
  assert(typeof iteratee === 'function', 'iteratee must be a function')
  iteratee = asyncWrap(iteratee)
  return await asyncMapEntries(obj, async (v, k, o) => {
    const nk = await iteratee(v, k, o)
    return [nk, v]
  }, queueOrConcurrency)
}

export default asyncMapKeys
