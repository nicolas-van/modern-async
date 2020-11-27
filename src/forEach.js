
import forEachLimit from './forEachLimit'

/**
 * Calls the function iteratee on each element of iterable.
 * Multiple calls to iteratee will be performed in parallel.
 *
 * @param {Iterable} iterable An iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable. It will receive
 * three arguments:
 *   * value: The current value to process
 *   * index: The index in the iterable. Will start from 0.
 *   * iterable: The iterable on which the operation is being performed.
 * @returns {Promise} A promise that will be resolved when all the calls to iteratee have been done.
 * This promise will be rejected if any call to iteratee throws an exception.
 */
export default async function forEach (iterable, iteratee) {
  return forEachLimit(iterable, iteratee, Number.POSITIVE_INFINITY)
}
