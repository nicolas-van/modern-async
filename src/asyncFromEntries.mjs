
import asyncIterableWrap from './asyncIterableWrap.mjs'

/**
 * Fully consumes an iterable or async iterable containing key-value pairs an returns
 * a new object built with those key-value pairs.
 *
 * This function is an alternative to standard `Object.fromPairs` but accepting an async
 * iterable.
 *
 * @param {Iterable | AsyncIterable} iterable An iterable or async iterable yielding key-value pairs.
 * Key value-pairs must be tuples containing two objects:
 *   * The key
 *   * The value
 * @returns {Promise<object>} A promise that will be resolved with a new object built with the
 * key-value pairs of the iterable.
 * @example
 * // Example using a synchronous iterable
 * import { asyncFromEntries } from 'modern-async'
 *
 * const entries = [["a", 1], ["b", 2], ["c", 3]]
 *
 * const obj = await asyncFromEntries(entries)
 * console.log(obj) // prints Object { a: 1, b: 2, c: 3 }
 * @example
 * // Example using an asynchronous iterable
 * import { asyncFromEntries, asyncSleep } from 'modern-async'
 *
 * async function * asyncEntryGenerator() {
 *   await asyncSleep(10) // waits 10ms
 *   yield ["a", 1]
 *   await asyncSleep(10) // waits 10ms
 *   yield ["b", 2]
 *   await asyncSleep(10) // waits 10ms
 *   yield ["c", 3]
 * }
 *
 * const obj = await asyncFromEntries(asyncEntryGenerator())
 * console.log(obj) // prints Object { a: 1, b: 2, c: 3 }
 */
async function asyncFromEntries (iterable) {
  const it = asyncIterableWrap(iterable)
  const obj = {}
  for await (const [key, value] of it) {
    obj[key] = value
  }
  return obj
}

export default asyncFromEntries
