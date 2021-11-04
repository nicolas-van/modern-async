
import asyncIterableWrap from './asyncIterableWrap.mjs'

/**
 * Fully consumes an iteratable or async iterable an returns an array with all the elements it contained.
 *
 * @param {Iterable | AsyncIterable} iterable An iterator or async iterator.
 * @returns {Promise<any[]>} An array.
 * @example
 * import { toArray, sleep } from 'modern-async'
 *
 * // example async generator
 * async function* asyncGenerator() {
 *   for (let i = 0; i < 3; i += 1) {
 *     await sleep(10)
 *     yield i
 *   }
 * }
 *
 * console.log(await toArray(asyncGenerator()))
 * // prints [0, 1, 2]
 */
async function toArray (iterable) {
  const it = asyncIterableWrap(iterable)
  const results = []
  for await (const el of it) {
    results.push(el)
  }
  return results
}

export default toArray
