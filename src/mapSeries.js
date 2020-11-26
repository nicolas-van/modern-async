
import mapLimit from './mapLimit'

/**
 * Produces a new collection of values by mapping each value in iterable through the iteratee function.
 * Multiple calls to iteratee will be performed sequentially.
 *
 * @param {*} iterable An iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable.
 * @returns {Promise} A promise that will be resolved with an Array containing all the mapped value,
 * or will be rejected if any of the calls to iteratee throws an exception.
 */
export default function mapSeries (iterable, iteratee) {
  return mapLimit(iterable, iteratee, 1)
}
