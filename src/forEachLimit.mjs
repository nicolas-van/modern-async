
import assert from 'nanoassert'
import mapGenerator from './mapGenerator.mjs'
import Queue from './Queue.mjs'

/**
 * Calls a function on each element of iterable.
 *
 * Multiple calls to `iteratee` will be performed in parallel, up to the concurrency limit.
 *
 * If any of the calls to iteratee throws an exception the returned promise will be rejected and the remaining
 * pending tasks will be cancelled.
 *
 * @param {Iterable | AsyncIterable} iterable An iterable or async iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable. It will receive
 * three arguments:
 *   * `value`: The current value to process
 *   * `index`: The index in the iterable. Will start from 0.
 *   * `iterable`: The iterable on which the operation is being performed.
 * @param {number} concurrency The number of times iteratee can be called concurrently.
 * @returns {Promise} A promise that will be resolved when all the calls to `iteratee` have been done.
 * This promise will be rejected if any call to `iteratee` throws an exception.
 * @example
 * import { forEachLimit, asyncRoot, sleep } from 'modern-async'
 *
 * asyncRoot(async () => {
 *   const array = [1, 2, 3]
 *   await forEachLimit(array, async (v) => {
 *     // these calls will be performed in parallel with a maximum of 2
 *     // concurrent calls
 *     await sleep(Math.random() * 10) // waits a random amount of time between 0ms and 10ms
 *     console.log(v)
 *   }, 2)
 *   // prints 1, 2 and 3 in a random order (it will always print 1 or 2 before printing 3 due to
 *   // the concurrency limit and the internal scheduling order)
 * })
 */
async function forEachLimit (iterable, iteratee, concurrency) {
  assert(typeof iteratee === 'function', 'iteratee must be a function')
  const queue = new Queue(concurrency)
  // eslint-disable-next-line no-unused-vars
  for await (const _el of mapGenerator(iterable, iteratee, queue)) {
    // do nothing
  }
}

export default forEachLimit
