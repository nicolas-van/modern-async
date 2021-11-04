
import reduce from './reduce.mjs'
import assert from 'nanoassert'
import asyncWrap from './asyncWrap.mjs'

/**
 * Performs a reduce operation as defined in the `Array.reduceRight()` method but using an asynchronous
 * function as reducer. The reducer will be called sequentially.
 *
 * @param {Iterable | AsyncIterable} iterable An iterable object.
 * @param {Function} reducer The reducer function. It will be called with four arguments:
 *   * `accumulator`: The last calculated value (or the first value of the iterable if no initial value is provided)
 *   * `value`: The current value
 *   * `index`: The current index in the iterable. Will start from the last index if no initial value is provided,
 *     the last index minus 1 otherwise.
 *   * `iterable`: The iterable on which the reduce operation is performed.
 * @param {any} [initial] The initial value that will be used as accumulator in the first call to
 *   reducer. If omitted the first element of `iterable` will be used as accumulator and `reducer`
 *   will only be called from from the second element of the list (as defined in the `Array.reduce()`
 *   function).
 * @returns {Promise} A promise that will be resolved with the result of the reduce operation,
 *   or rejected if any of the calls to `reducer` throws an exception.
 * @example
 * import { reduceRight, sleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 * const result = await reduceRight(array, async (v, p) => {
 *   // these calls will be performed sequentially
 *   await sleep(10) // waits 10ms
 *   return v + p
 * })
 * console.log(result) // prints 6
 * // total processing time should be ~ 20ms
 */
async function reduceRight (iterable, reducer, initial = undefined) {
  assert(typeof reducer === 'function', 'iteratee must be a function')
  reducer = asyncWrap(reducer)
  const arr = []
  for await (const el of iterable) {
    arr.push(el)
  }
  arr.reverse()
  return reduce(arr, async (accumulator, value, index, iterable) => {
    return reducer(accumulator, value, arr.length - 1 - index, iterable)
  }, initial)
}

export default reduceRight
