
import Queue from './Queue.mjs'
import asyncGeneratorMap from './asyncGeneratorMap.mjs'
import assert from 'nanoassert'

/**
 * Returns the index of the first element of an iterable that passes an asynchronous truth test.
 *
 * The calls to `iteratee` will run in parallel, up to a concurrency limit. Regardless of which function
 * call returns first, this function will always return the first in iterable order able to pass the truth
 * test. Concurrency has no impact on the value that will be returned by this function.
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
 *   console.log(result) // will always print 0
 * })
 */
async function findIndexLimit (iterable, iteratee, concurrency) {
  assert(typeof iteratee === 'function', 'iteratee must be a function')
  const queue = new Queue(concurrency)
  for await (const [index, pass] of asyncGeneratorMap(iterable, async (value, index, iterable) => {
    return [index, await iteratee(value, index, iterable)]
  }, queue)) {
    if (pass) {
      return index
    }
  }
  return -1
}

export default findIndexLimit
