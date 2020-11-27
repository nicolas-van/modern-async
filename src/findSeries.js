
import findLimit from './findLimit'

/**
 * Returns the first element of an iterable that passes an asynchronous truth test.
 *
 * The iteratee will be run sequentially. As opposed to find() and findLimit() this ensures
 * that if multiple values may pass the truth test it will be the first one of the iterable that will be
 * returned.
 *
 * In case of exception in one of the iteratee calls the promise returned by this function will be
 * rejected with the exception.
 *
 * @param {Iterable} iterable An iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable. It will receive
 * three arguments:
 *   * value: The current value to process
 *   * index: The index in the iterable. Will start from 0.
 *   * iterable: The iterable on which the operation is being performed.
 * @returns {Promise} A promise that will be resolved with the index of the first found value or rejected if one of the
 * iteratee calls throws an exception before finding a value. If no value is found it will return -1.
 */
export default async function findSeries (iterable, iteratee) {
  return findLimit(iterable, iteratee, 1)
}
