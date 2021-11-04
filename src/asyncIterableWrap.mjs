
/**
 * Wraps an iterable or async iterable into an iterable that is guaranted to be async.
 *
 * @param {Iterable | AsyncIterable} iterable An iterable or async iterable object.
 * @yields {any} The elements returned by the original iterable.
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
 * const asyncIterable = asyncIterableWrap(syncGenerator())
 *
 * for await (const el of asyncIterable) {
 *   console.log(el)
 * }
 * // will print:
 * // 0
 * // 1
 * // 2
 */
async function * asyncIterableWrap (iterable) {
  for await (const el of iterable) {
    yield el
  }
}

export default asyncIterableWrap
