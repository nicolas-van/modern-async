
import findLimit from './findLimit'

/**
 * Returns the first element of an iterable that passes an asynchronous truth test.
 *
 * The iteratee will be run in parallel. This implies that the element found by this function may not
 * be the first element of the iterable able to pass the truth test. It will be the first one in time
 * for which one of the parallel calls to iteratee was able to return a positive result. If you need
 * a sequential alternative use findSeries().
 *
 * In case of exception in one of the iteratee calls the promise returned by this function will be
 * rejected with the exception. In the very specific case where a result is found and an
 * already started task throws an exception that exception will be plainly ignored.
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
async function find (iterable, iteratee) {
  return findLimit(iterable, iteratee, Number.POSITIVE_INFINITY)
}

export default find
