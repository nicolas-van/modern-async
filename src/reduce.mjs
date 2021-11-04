
import assert from 'nanoassert'
import asyncWrap from './asyncWrap.mjs'

/**
 * Performs a reduce operation as defined in the `Array.reduce()` method but using an asynchronous
 * function as reducer. The reducer will be called sequentially.
 *
 * @param {Iterable | AsyncIterable} iterable An iterable or async iterable object.
 * @param {Function} reducer The reducer function. It will be called with four arguments:
 *   * `accumulator`: The last calculated value (or the first value of the iterable if no initial value is provided)
 *   * `value`: The current value
 *   * `index`: The current index in the iterable. Will start from 0 if no initial value is provided, 1 otherwise.
 *   * `iterable`: The iterable on which the reduce operation is performed.
 * @param {any} [initial] The initial value that will be used as accumulator in the first call to
 *   `reducer`. If omitted the first element of `iterable` will be used as accumulator and `reducer`
 *   will only be called from from the second element of the list (as defined in the `Array.reduce()`
 *   function).
 * @returns {Promise} A promise that will be resolved with the result of the reduce operation,
 *   or rejected if any of the calls to `reducer` throws an exception.
 * @example
 * import { reduce, sleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 * const result = await reduce(array, async (v, p) => {
 *   // these calls will be performed sequentially
 *   await sleep(10) // waits 10ms
 *   return v + p
 * })
 * console.log(result) // prints 6
 * // total processing time should be ~ 20ms
 */
async function reduce (iterable, reducer, initial = undefined) {
  assert(typeof reducer === 'function', 'iteratee must be a function')
  reducer = asyncWrap(reducer)
  if (initial !== undefined) {
    let current = initial
    let i = 0
    for await (const el of iterable) {
      current = await reducer(current, el, i, iterable)
      i += 1
    }
    return current
  } else {
    let i = 0
    let current
    for await (const el of iterable) {
      if (i === 0) {
        current = el
      } else {
        current = await reducer(current, el, i, iterable)
      }
      i += 1
    }
    if (i === 0) {
      throw new TypeError('Reduce of empty array with no initial value')
    }
    return current
  }
}

export default reduce
