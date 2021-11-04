
import findIndexLimit from './findIndexLimit.mjs'
import Queue from './Queue.mjs'

/**
 * Returns `true` if at least one element of an iterable pass a truth test and `false` otherwise.
 *
 * The calls to `iteratee` will be performed in a queue to limit the concurrency of these calls. If any
 * truth test returns `true` the promise is immediately resolved.
 *
 * Whenever a test returns `true`, all the remaining tasks will be cancelled as long
 * as they didn't started already. In case of exception in one of the `iteratee` calls the promise
 * returned by this function will be rejected with the exception and the remaining pending
 * tasks will also be cancelled. In the very specific case where a test returns `true` and an
 * already started task throws an exception that exception will be plainly ignored.
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
 * @returns {Promise<boolean>} A promise that will be resolved to `true` if at least one value pass the truth test and `false`
 * if none of them do. That promise will be rejected if one of the truth test throws an exception.
 * @example
 * import { someLimit, sleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 *
 * const result = await someLimit(array, async (v) => {
 *   // these calls will be performed in parallel with a maximum of 2
 *   // concurrent calls
 *   await sleep(10) // waits 10ms
 *   return v % 2 === 0
 * }, 2)
 * console.log(result) // prints true
 * // total processing time should be ~ 10ms
 */
async function someLimit (iterable, iteratee, queueOrConcurrency) {
  const index = await findIndexLimit(iterable, iteratee, queueOrConcurrency, false)
  const result = index !== -1
  return result
}

export default someLimit
