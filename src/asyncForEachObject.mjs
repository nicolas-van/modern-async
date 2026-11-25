
import asyncGeneratorMap from './asyncGeneratorMap.mjs'
import generatorEntries from './generatorEntries.mjs'
import Queue from './Queue.mjs'
import asyncWrap from './asyncWrap.mjs'

/**
 * Calls a function on each key-value pair of an object.
 *
 * The calls to `iteratee` will be performed asynchronously in a {@link Queue}, allowing control over the concurrency of those calls.
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
 * @returns {Promise} A promise that will be resolved when all the calls to `iteratee` have been done.
 * This promise will be rejected if any call to `iteratee` throws an exception.
 * @see {@link asyncForEach} to iterate over an iterable
 * @example
 * // example using the default concurrency of 1
 * import { asyncForEachObject, asyncSleep } from 'modern-async'
 *
 * const obj = {a: 1, b: 2, c: 3}
 * await asyncForEachObject(obj, async (v) => {
 *   // these calls will be performed sequentially
 *   await asyncSleep(Math.random() * 10) // waits a random amount of time between 0ms and 10ms
 *   console.log(v)
 * })
 * // prints 1, 2 and 3 in that exact order
 * @example
 * // example using a set concurrency
 * import { asyncForEachObject, asyncSleep } from 'modern-async'
 *
 * const obj = {a: 1, b: 2, c: 3}
 * await asyncForEachObject(obj, async (v) => {
 *   // these calls will be performed in parallel with a maximum of 2
 *   // concurrent calls
 *   await asyncSleep(Math.random() * 10) // waits a random amount of time between 0ms and 10ms
 *   console.log(v)
 * }, 2)
 * // prints 1, 2 and 3 in a random order (it will always print 1 or 2 before printing 3 due to
 * // the concurrency limit and the internal scheduling order)
 * @example
 * // example using infinite concurrency
 * import { asyncForEachObject, asyncSleep } from 'modern-async'
 *
 * const obj = {a: 1, b: 2, c: 3}
 * await asyncForEachObject(obj, async (v) => {
 *   // these calls will be performed in parallel
 *   await asyncSleep(Math.random() * 10) // waits a random amount of time between 0ms and 10ms
 *   console.log(v)
 * }, Number.POSITIVE_INFINITY)
 * // prints 1, 2 and 3 in a random order
 */
async function asyncForEachObject (obj, iteratee, queueOrConcurrency = 1) {
  iteratee = asyncWrap(iteratee)
  // eslint-disable-next-line no-unused-vars
  for await (const _el of asyncGeneratorMap(generatorEntries(obj), async ([k, v]) => {
    await iteratee(v, k, obj)
  }, queueOrConcurrency, false)) {
    // do nothing
  }
}

export default asyncForEachObject
