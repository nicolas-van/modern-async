
import findIndexLimit from './findIndexLimit'

/**
 * Returns the first element of an iterable that passes an asynchronous truth test.
 *
 * The iteratee will be run in parallel, up to a concurrency limit. This implies that
 * the element found by this function may not be the first element of the iterable able to pass the
 * truth test. It will be the first one for which one of the parallel calls to iteratee was able to
 * return a positive result. If you need a sequential alternative use findSeries().
 *
 * Whenever a result is found, all the remaining tasks will be cancelled as long
 * as they didn't started already. In case of exception in one of the iteratee calls the promise
 * returned by this function will be rejected with the exception and the remaining pending
 * tasks will also be cancelled. In the very specific case where a result is found and an
 * already started task throws an exception that exception will be plainly ignored.
 *
 * @param {Iterable} iterable An iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable. It will receive
 * three arguments:
 *   * value: The current value to process
 *   * index: The index in the iterable. Will start from 0.
 *   * iterable: The iterable on which the operation is being performed.
 * @param {number} concurrency The number of times iteratee can be called concurrently.
 * @returns {Promise} A promise that will be resolved with the first found value or rejected if one of the
 * iteratee calls throws an exception before finding a value. If no value is found it will return undefined.
 */
export default async function findLimit (iterable, iteratee, concurrency) {
  const arr = Array.from(iterable)
  const index = await findIndexLimit(iterable, iteratee, concurrency)
  return index === -1 ? undefined : arr[index]
}
