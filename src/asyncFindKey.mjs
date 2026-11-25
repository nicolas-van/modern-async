
import asyncFindInternal from './asyncFindInternal.mjs'
import generatorEntries from './generatorEntries.mjs'
import asyncWrap from './asyncWrap.mjs'
import Queue from './Queue.mjs'

/**
 * Returns the key of the first element of an object that passes an asynchronous truth test.
 *
 * The calls to `iteratee` will be performed asynchronously in a {@link Queue}, allowing control over the concurrency of those calls.
 *
 * Whenever a result is found, all the remaining tasks will be cancelled as long
 * as they didn't started already. In case of exception in one of the `iteratee` calls the promise
 * returned by this function will be rejected with the exception and the remaining pending
 * tasks will also be cancelled. In the very specific case where a result is found and an
 * already started task throws an exception that exception will be plainly ignored.
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
 * @param {boolean} [ordered] If true this function will return on the first key in the object
 * order for which `iteratee` returned true. If false it will be the first in time.
 * @returns {Promise<any>} A promise that will be resolved with the key of the first found value. It will be
 * rejected if one of the `iteratee` calls throws an exception before finding a value, or if no value is found.
 * @see {@link asyncFind} to find a value in an iterable
 * @example
 * // example using the default concurrency of 1
 * import { asyncFindKey, asyncSleep } from 'modern-async'
 *
 * const obj = {a: 1, b: 2, c: 3}
 * const result = await asyncFindKey(obj, async (v) => {
 *   // these calls will be performed sequentially
 *   await asyncSleep(Math.random() * 10) // waits a random amount of time between 0ms and 10ms
 *   return v % 2 === 1
 * })
 * console.log(result) // prints "a"
 * @example
 * // example using a set concurrency
 * import { asyncFindKey, asyncSleep } from 'modern-async'
 *
 * const obj = {a: 1, b: 2, c: 3, d: 4, e: 5}
 * const result = await asyncFindKey(obj, async (v) => {
 *   // these calls will be performed in parallel with a maximum of 3
 *   // concurrent calls
 *   await asyncSleep(Math.random() * 10) // waits a random amount of time between 0ms and 10ms
 *   return v % 2 === 1
 * }, 3)
 * console.log(result) // prints "a" or "c", randomly
 * @example
 * // example using infinite concurrency
 * import { asyncFindKey, asyncSleep } from 'modern-async'
 *
 * const obj = {a: 1, b: 2, c: 3}
 * const result = await asyncFindKey(obj, async (v) => {
 *   // these calls will be performed in parallel
 *   await asyncSleep(Math.random() * 10) // waits a random amount of time between 0ms and 10ms
 *   return v % 2 === 1
 * }, Number.POSITIVE_INFINITY)
 * console.log(result) // prints "a" or "c", randomly
 */
async function asyncFindKey (obj, iteratee, queueOrConcurrency = 1, ordered = false) {
  iteratee = asyncWrap(iteratee)
  // eslint-disable-next-line no-unused-vars
  const [k, _] = (await asyncFindInternal(generatorEntries(obj), async ([k, v]) => {
    return await iteratee(v, k, obj)
  }, queueOrConcurrency, ordered))[1]
  return k
}

export default asyncFindKey
