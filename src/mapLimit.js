
import Queue from './Queue'
import assert from 'assert'

/**
 * Produces a new collection of values by mapping each value in iterable through the iteratee function.
 * Multiple calls to iteratee will be performed in parallel, up to the concurrency limit.
 *
 * @param {*} iterable An iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable.
 * @param {number} concurrency The number of times iteratee can be called concurrently.
 * @returns {Promise} A promise that will be resolved with an Array containing all the mapped value,
 * or will be rejected if any of the calls to iteratee throws an exception.
 */
export default async function mapLimit (iterable, iteratee, concurrency) {
  assert(typeof iteratee === 'function', 'iteratee must be a function')
  const queue = new Queue(concurrency)
  const promises = []
  for (const el of iterable) {
    promises.push(queue.exec(async () => {
      return iteratee(el)
    }))
  }
  return Promise.all(promises)
}
