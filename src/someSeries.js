
import someLimit from './someLimit'

/**
 * Returns true if all elements of an iterable pass a truth test and false otherwise.
 *
 * The iteratee will be run sequentially. If any truth test returns true the promise is
 * immediately resolved.
 *
 * In case of exception in one of the iteratee calls the promise returned by this function will be
 * rejected with the exception and the remaining pending tasks will be cancelled.
 *
 * @param {Iterable} iterable An iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable. It will receive
 * three arguments:
 *   * value: The current value to process
 *   * index: The index in the iterable. Will start from 0.
 *   * iterable: The iterable on which the operation is being performed.
 * @returns {Promise} A promise that will be resolved to true if at least one value pass the truth test and false
 * if none of them do. That promise will be rejected if one of the truth test throws an exception.
 */
export default async function someSeries (iterable, iteratee) {
  return someLimit(iterable, iteratee, 1)
}
