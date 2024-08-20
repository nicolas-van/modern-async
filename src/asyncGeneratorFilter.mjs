
import asyncGeneratorMap from './asyncGeneratorMap.mjs'
import Queue from './Queue.mjs'
import asyncWrap from './asyncWrap.mjs'

/**
 * Produces a an async iterable that will return each value or `iterable` which pass an asynchronous truth test.
 *
 * The iterable will perform the calls to `iteratee` asynchronously in a {@link Queue} to limit the concurrency of
 * these calls. The iterable will consume values from `iterable` only if slots are available in the
 * queue.
 *
 * If the returned iterable is not fully consumed it will stop consuming new values from `iterable` and scheduling
 * new calls to `iteratee` in the queue, but already scheduled tasks will still be executed.
 *
 * If `iterable` or any of the calls to `iteratee` throws an exception all pending tasks will be cancelled and the
 * returned async iterable will throw that exception.
 *
 * @param {Iterable | AsyncIterable} iterable An iterable or async iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable. It will receive
 * three arguments:
 *   * `value`: The current value to process
 *   * `index`: The index in the iterable. Will start from 0.
 *   * `iterable`: The iterable on which the operation is being performed.
 * @param {Queue | number} [queueOrConcurrency] If a {@link Queue} is specified it will be used to schedule the calls to
 * `iteratee`. If a number is specified it will be used as the concurrency of a {@link Queue} that will be created
 * implicitly for the same purpose. Defaults to `1`.
 * @param {boolean} [ordered] If true the results will be yielded in the same order as in the source
 * iterable, regardless of which calls to iteratee returned first. If false the the results will be yielded as soon
 * as a call to iteratee returned. Defaults to `true`.
 * @yields {any} Each element of `iterable` for which `iteratee` returned `true`.
 * @example
 * import {asyncGeneratorFilter, asyncSleep} from 'modern-async'
 *
 * const generator = function * () {
 *   for (let i = 0; i < 10000; i += 1) {
 *     yield i
 *   }
 * }
 * const filterGenerator = asyncGeneratorFilter(generator(), async (v) => {
 *   await asyncSleep(1000)
 *   return v % 3 === 0
 * })
 * for await (const el of filterGenerator) {
 *   console.log(el)
 * }
 * // will print "0", "3", "6", etc... Only one number will be printed every 3 seconds.
 */
async function * asyncGeneratorFilter (iterable, iteratee, queueOrConcurrency = 1, ordered = true) {
  iteratee = asyncWrap(iteratee)
  for await (const [value, pass] of asyncGeneratorMap(iterable, async (v, i, t) => {
    return [v, await iteratee(v, i, t)]
  }, queueOrConcurrency, ordered)) {
    if (pass) {
      yield value
    }
  }
}

export default asyncGeneratorFilter
