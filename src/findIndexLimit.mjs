
import Queue from './Queue.mjs'
import assert from 'nanoassert'

/**
 * Returns the index of the first element of an iterable that passes an asynchronous truth test.
 *
 * The calls to `iteratee` will run in parallel, up to a concurrency limit. This implies that
 * the element found by this function may not be the first element of the iterable able to pass the
 * truth test. It will be the first one in time for which one of the parallel calls to `iteratee` was able to
 * return a positive result. If you need a sequential alternative use `findIndexSeries()`.
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
 *   * `value`: The current value to process
 *   * `index`: The index in the iterable. Will start from 0.
 *   * `iterable`: The iterable on which the operation is being performed.
 * @param {number} concurrency The number of times iteratee can be called concurrently.
 * @returns {Promise} A promise that will be resolved with the index of the first found value or rejected if one of the
 * `iteratee` calls throws an exception before finding a value. If no value is found it will return `-1`.
 * @example
 * import { findIndexLimit, asyncRoot, sleep } from 'modern-async'
 *
 * asyncRoot(async () => {
 *   const array = [1, 2, 3, 4, 5]
 *   const result = await findIndexLimit(array, async (v) => {
 *     // these calls will be performed in parallel with a maximum of 3
 *     // concurrent calls
 *     await sleep(Math.random() * 10) // waits a random amount of time between 0ms and 10ms
 *     return v % 2 === 1
 *   }, 3)
 *   console.log(result) // prints 0, 2 or 4 randomly
 *   // 4 is a potential result in this case even with a concurrency of 3 due to how
 *   // randomness works, and all asynchronous operations are inherently random. The only way to ensure an
 *   // order is to use a concurreny of 1 or to use findSeries() which does the same thing.
 * })
 */
async function findIndexLimit (iterable, iteratee, concurrency) {
  assert(typeof iteratee === 'function', 'iteratee must be a function')
  const queue = new Queue(concurrency)
  const promises = []
  let i = 0
  for (const el of iterable) {
    const index = i
    promises.push(queue.exec(async () => {
      return [index, await iteratee(el, index, iterable)]
    }))
    i += 1
  }

  let current = promises

  try {
    while (current.length > 0) {
      const [index, result] = await Promise.race(current)
      if (result) {
        return index
      }
      promises[index] = null
      current = promises.filter((p) => p !== null)
    }
    return -1
  } finally {
    current.forEach((p) => {
      p.catch(() => {
        // ignore the exception
      })
    })
    queue.cancelAllPending()
  }
}

export default findIndexLimit
