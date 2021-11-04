
import mapGenerator from './mapGenerator.mjs'
import Queue from './Queue.mjs'

/**
 * Calls a function on each element of iterable.
 *
 * The calls to `iteratee` will be performed in a queue to limit the concurrency of these calls.
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
 * @param {Queue | number} queueOrConcurrency If a queue is specified it will be used to schedule the calls to
 * `iteratee`. If a number is specified it will be used as the concurrency of a Queue that will be created
 * implicitly for the same purpose.
 * @returns {Promise} A promise that will be resolved when all the calls to `iteratee` have been done.
 * This promise will be rejected if any call to `iteratee` throws an exception.
 * @example
 * import { forEachLimit, sleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 * await forEachLimit(array, async (v) => {
 *   // these calls will be performed in parallel with a maximum of 2
 *   // concurrent calls
 *   await sleep(Math.random() * 10) // waits a random amount of time between 0ms and 10ms
 *   console.log(v)
 * }, 2)
 * // prints 1, 2 and 3 in a random order (it will always print 1 or 2 before printing 3 due to
 * // the concurrency limit and the internal scheduling order)
 */
async function forEachLimit (iterable, iteratee, queueOrConcurrency) {
  // eslint-disable-next-line no-unused-vars
  for await (const _el of mapGenerator(iterable, iteratee, queueOrConcurrency)) {
    // do nothing
  }
}

export default forEachLimit
