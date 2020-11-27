
import assert from 'assert'

/**
 * Performs a reduce operation as defined in the Array.reduce() method but using an asynchronous
 * function as reducer. The reducer will be called sequentially.
 *
 * @param {Iterable} iterable An iterable object.
 * @param {Function} reducer The reducer function. It will be called with four arguments:
 *   * accumulator: The last calculated value (or the first value of the iterable if no initial value is provided)
 *   * value: The current value
 *   * index: The current index in the iterable. Will start from 0 if no initial value is provided, 1 otherwise.
 *   * iterable: The iterable on which the reduce operation is performed.
 * @param {*} initial The initial value that will be used as accumulator in the first call to
 *   reducer. If omitted the first element of the iterable will be used as accumulator and reducer
 *   will only be called from from the second element of the list (as defined in the Array.reduce()
 *   function).
 * @returns {Promise} A promise that will be resolved with the result of the reduce operation,
 *   or rejected if any of the calls to reducer throws an exception.
 */
export default async function reduce (iterable, reducer, initial = undefined) {
  assert(typeof reducer === 'function', 'reducer must be a function')
  if (initial !== undefined) {
    let current = initial
    let i = 0
    for (const el of iterable) {
      current = await reducer(current, el, i, iterable)
      i += 1
    }
    return current
  } else {
    let i = 0
    let current
    for (const el of iterable) {
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
