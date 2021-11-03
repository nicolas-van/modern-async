
import mapGenerator from './mapGenerator.mjs'
import assert from 'nanoassert'
import Queue from './Queue.mjs'
import asyncWrap from './asyncWrap.mjs'

/**
 * Produces a an async iterator that will return each value or `iterable` which pass an asynchronous truth test.
 *
 * The iterator will try to consume as fast as possible the values from `iterable` and will performs the call
 * to `iteratee` in a queue. This allows to limit the concurrency of the calls to `iteratee`.
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
 * @param {number | Queue} concurrencyOrQueue Defaults to `Number.POSITIVE_INFINITY`. The maximum number of times
 * iteratee can be called concurrently or a queue.
 * @param {boolean} ordered Defaults to `true`. If true the results will be yieled in the same order as in the source
 * iterable, regardless of which calls to iteratee returned first. If false the the results will be yielded as soon
 * as a call to iteratee returned.
 * @yields {*} Each element of `iterable` for which `iteratee` returned `true`.
 * @example
 * TODO
 */
async function * filterGenerator (iterable, iteratee, concurrencyOrQueue, ordered = true) {
  assert(typeof iteratee === 'function', 'iteratee must be a function')
  iteratee = asyncWrap(iteratee)
  for await (const [value, pass] of mapGenerator(iterable, async (v, i, t) => {
    return [v, await iteratee(v, i, t)]
  }, concurrencyOrQueue, ordered)) {
    if (pass) {
      yield value
    }
  }
}

export default filterGenerator
