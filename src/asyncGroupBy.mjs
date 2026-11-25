
import asyncGeneratorMap from './asyncGeneratorMap.mjs'
import asyncWrap from './asyncWrap.mjs'
import Queue from './Queue.mjs'

/**
 * Groups the values of an iterable according to the groups returned by an asynchronous function.
 *
 * The calls to `iteratee` will be performed asynchronously in a {@link Queue}, allowing control over the concurrency of those calls.
 *
 * If any of the calls to `iteratee` throws an exception the returned promise will be rejected and the remaining
 * pending tasks will be cancelled.
 *
 * @param {Iterable | AsyncIterable} iterable An iterable or async iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable. It will receive
 * three arguments:
 *   * `value`: The current value to process
 *   * `index`: The index in the iterable. Will start from 0.
 *   * `iterable`: The iterable on which the operation is being performed.
 *
 * That function must return the group to which the value belongs.
 * @param {Queue | number} [queueOrConcurrency] If a {@link Queue} is specified it will be used to schedule the calls to
 * `iteratee`. If a number is specified it will be used as the concurrency of a {@link Queue} that will be created
 * implicitly for the same purpose. Defaults to `1`.
 * @returns {Promise<object>} A promise that will be resolved with an object mapping each group returned by
 * `iteratee` to an array of the values belonging to that group. This promise will be rejected if any of the
 * `iteratee` calls throws an exception.
 * @example
 * // example using the default concurrency of 1
 * import { asyncGroupBy, asyncSleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 * const result = await asyncGroupBy(array, async (v) => {
 *   // these calls will be performed sequentially
 *   await asyncSleep(10) // waits 10ms
 *   return v % 2 === 1 ? 'odd' : 'even'
 * })
 * console.log(result) // prints Object { odd: [1, 3], even: [2] }
 * // total processing time should be ~ 30ms
 * @example
 * // example using a set concurrency
 * import { asyncGroupBy, asyncSleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 * const result = await asyncGroupBy(array, async (v) => {
 *   // these calls will be performed in parallel with a maximum of 2
 *   // concurrent calls
 *   await asyncSleep(10) // waits 10ms
 *   return v % 2 === 1 ? 'odd' : 'even'
 * }, 2)
 * console.log(result) // prints Object { odd: [1, 3], even: [2] }
 * // total processing time should be ~ 20ms
 * @example
 * // example using infinite concurrency
 * import { asyncGroupBy, asyncSleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 * const result = await asyncGroupBy(array, async (v) => {
 *   // these calls will be performed in parallel
 *   await asyncSleep(10) // waits 10ms
 *   return v % 2 === 1 ? 'odd' : 'even'
 * }, Number.POSITIVE_INFINITY)
 * console.log(result) // prints Object { odd: [1, 3], even: [2] }
 * // total processing time should be ~ 10ms
 */
async function asyncGroupBy (iterable, iteratee, queueOrConcurrency = 1) {
  iteratee = asyncWrap(iteratee)
  const groups = {}
  for await (const [group, value] of asyncGeneratorMap(iterable, async (v, i, it) => {
    const group = await iteratee(v, i, it)
    return [group, v]
  }, queueOrConcurrency)) {
    if (!(group in groups)) {
      groups[group] = []
    }
    groups[group].push(value)
  }
  return groups
}

export default asyncGroupBy
