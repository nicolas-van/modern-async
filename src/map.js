
import mapLimit from './mapLimit'

/**
 * Produces a new collection of values by mapping each value in iterable through the iteratee function.
 * Multiple calls to iteratee will be performed in parallel.
 *
 * @param {Iterable} iterable An iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable. It will receive
 * three arguments:
 *   * value: The current value to process
 *   * index: The index in the iterable. Will start from 0.
 *   * iterable: The iterable on which the operation is being performed.
 * @returns {Promise} A promise that will be resolved with an Array containing all the mapped value,
 * or will be rejected if any of the calls to iteratee throws an exception.
 */
async function map (iterable, iteratee) {
  return mapLimit(iterable, iteratee, Number.POSITIVE_INFINITY)
}

export default map
