
import asyncReduce from './asyncReduce.mjs'
import asyncWrap from './asyncWrap.mjs'
import asyncIterableToArray from './asyncIterableToArray.mjs'

/**
 * Performs a reduce operation as defined in the `Array.reduceRight()` method but using an asynchronous
 * function as reducer. The reducer will be called sequentially.
 * 
 * Please note that this function exists only to provide compatibility with standard `Array.reduceRight()`.
 * Internally it only reads all values from the given iterator, store them all in an array, revert that array
 * and performs a common {@link asyncReduce} call. (Functions iterating on arrays from right to left do not
 * apply properly to the iterable concept and should be avoided when trying to use that concept.)
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
 * import { asyncReduceRight, asyncSleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 * const result = await asyncReduceRight(array, async (v, p) => {
 *   // these calls will be performed sequentially
 *   await asyncSleep(10) // waits 10ms
 *   return v + p
 * })
 * console.log(result) // prints 6
 * // total processing time should be ~ 20ms
 */
async function asyncReduceRight (iterable, reducer, initial = undefined) {
  reducer = asyncWrap(reducer)
  const arr = await asyncIterableToArray(iterable)
  arr.reverse()
  return asyncReduce(arr, async (accumulator, value, index, iterable) => {
    return reducer(accumulator, value, arr.length - 1 - index, iterable)
  }, initial)
}

export default asyncReduceRight
