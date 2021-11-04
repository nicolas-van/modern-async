
import someLimit from './someLimit.mjs'

/**
 * Returns `true` if at least one element of an iterable pass a truth test and `false` otherwise.
 *
 * The calls to `iteratee` will run in parallel. If any truth test returns `true` the promise is immediately resolved.
 *
 * In case of exception in one of the `iteratee` calls the promise returned by this function will be rejected
 * with the exception. In the very specific case where a test returns `true` and an already started task throws
 * an exception that exception will be plainly ignored.
 *
 * @param {Iterable | AsyncIterable} iterable An iterable or async iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable. It will receive
 * three arguments:
 *   * `value`: The current value to process
 *   * `index`: The index in the iterable. Will start from 0.
 *   * `iterable`: The iterable on which the operation is being performed.
 * @returns {Promise<boolean>} A promise that will be resolved to `true` if at least one value pass the truth test and `false`
 * if none of them do. That promise will be rejected if one of the truth test throws an exception.
 * @example
 * import { some, sleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 *
 * const result = await some(array, async (v) => {
 *   // these calls will be performed in parallel
 *   await sleep(10) // waits 10ms
 *   return v % 2 === 0
 * })
 * console.log(result) // prints true
 * // total processing time should be ~ 10ms
 */
async function some (iterable, iteratee) {
  return someLimit(iterable, iteratee, Number.POSITIVE_INFINITY)
}

export default some
