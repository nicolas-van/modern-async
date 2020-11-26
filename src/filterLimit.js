
import Queue from './Queue'
import assert from 'assert'

/**
 * Returns a new array of all the values in iterable which pass an asynchronous truth test. The calls
 * to iteratee will perform in parallel, up to the concurrency limit, but the results array will be
 * in the same order than the original.
 *
 * @param {*} iterable An iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable and should return a boolean.
 * @param {number} concurrency The number of times iteratee can be called concurrently.
 * @returns {Promise} A promise that will be resolved with an Array containing all the values that passed
 * the truth test. This promise will be rejected if any of the iteratee calls throws an exception.
 */
export default async function filterLimit (iterable, iteratee, concurrency) {
  assert(typeof iteratee === 'function', 'iteratee must be a function')
  const queue = new Queue(concurrency)
  const promises = []
  for (const el of iterable) {
    promises.push(queue.exec(async () => {
      return iteratee(el)
    }))
  }
  const results = await Promise.all(promises)
  const filtered = []
  let i = 0
  for (const el of iterable) {
    if (results[i]) {
      filtered.push(el)
    }
    i += 1
  }
  return filtered
}
