
import Queue from './Queue'
import assert from 'assert'

/**
 * Calls the function iteratee on each element of iterable.
 * Multiple calls to iteratee will be performed in parallel, up to the concurrency limit.
 *
 * @param {*} iterable An iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable.
 * @param {number} concurrency The number of times iteratee can be called concurrently.
 * @returns {Promise} A promise that will be resolved when all the calls to iteratee have been done.
 * This promise will be rejected if any call to iteratee throws an exception.
 */
export default async function forEachLimit (iterable, iteratee, concurrency) {
  assert(typeof iteratee === 'function', 'iteratee must be a function')
  const queue = new Queue(concurrency)
  const promises = []
  for (const el of iterable) {
    promises.push(queue.exec(async () => {
      iteratee(el)
    }))
  }
  await Promise.all(promises)
}
