
/**
 * Wraps an iterator or async iterator into an iterator that is guaranted to be async.
 *
 * @param {Iterable | AsyncIterable} iterator An iterator or async iterator.
 * @yields {*} The elements returned by the original iterator.
 * @example
 * import { asyncIterableWrap } from 'modern-async'
 *
 * // example sync generator
 * function* syncGenerator() {
 *   for (let i = 0; i < 3; i += 1) {
 *     yield i
 *   }
 * }
 *
 * const asyncIterator = asyncIterableWrap(syncGenerator())
 *
 * for await (const el of asyncIterator) {
 *   console.log(el)
 * }
 * // will print:
 * // 0
 * // 1
 * // 2
 */
async function * asyncIterableWrap (iterator) {
  for await (const el of iterator) {
    yield el
  }
}

export default asyncIterableWrap
