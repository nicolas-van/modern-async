
import mapGenerator from './mapGenerator.mjs'
import assert from 'nanoassert'
import Queue from './Queue.mjs'
import asyncWrap from './asyncWrap.mjs'

/**
 * Produces a an async iterator that will return each value or `iterable` which pass an asynchronous truth test.
 *
 * The iterator will perform the calls to `iteratee` in a queue to limit the concurrency of
 * these calls. The iterator will consume values from `iterable` only if slots are available in the
 * queue.
 *
 * If the returned iterator is not fully consumed it will stop consuming new values from `iterable` and scheduling
 * new calls to `iteratee` in the queue, but already scheduled tasks will still be executed.
 *
 * If `iterable` or any of the calls to `iteratee` throws an exception all pending tasks will be cancelled and the
 * returned async iterator will throw that exception.
 *
 * @param {Iterable | AsyncIterable} iterable An iterable or async iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable. It will receive
 * three arguments:
 *   * `value`: The current value to process
 *   * `index`: The index in the iterable. Will start from 0.
 *   * `iterable`: The iterable on which the operation is being performed.
 * @param {Queue | number} [queueOrConcurrency] If a queue is specified it will be used to schedule the calls to
 * `iteratee`. If a number is specified it will be used as the concurrency of a Queue that will be created
 * implicitly for the same purpose.
 * @param {boolean} [ordered] If true the results will be yielded in the same order as in the source
 * iterable, regardless of which calls to iteratee returned first. If false the the results will be yielded as soon
 * as a call to iteratee returned.
 * @yields {any} Each element of `iterable` for which `iteratee` returned `true`.
 * @example
 * import {filterGenerator, sleep} from 'modern-async'
 *
 * const iterator = function * () {
 *   for (let i = 0; i < 10000; i += 1) {
 *     yield i
 *   }
 * }
 * const filterIterator = filterGenerator(iterator(), async (v) => {
 *   await sleep(1000)
 *   return v % 3 === 0
 * })
 * for await (const el of filterIterator) {
 *   console.log(el)
 * }
 * // will print "0", "3", "6", etc... Only one number will be printed every 3 seconds.
 */
async function * filterGenerator (iterable, iteratee, queueOrConcurrency = 1, ordered = true) {
  assert(typeof iteratee === 'function', 'iteratee must be a function')
  iteratee = asyncWrap(iteratee)
  for await (const [value, pass] of mapGenerator(iterable, async (v, i, t) => {
    return [v, await iteratee(v, i, t)]
  }, queueOrConcurrency, ordered)) {
    if (pass) {
      yield value
    }
  }
}

export default filterGenerator
