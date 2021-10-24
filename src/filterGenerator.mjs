
import mapGenerator from './mapGenerator.mjs'
import assert from 'nanoassert'
import Queue from './Queue.mjs'
import asyncWrap from './asyncWrap.mjs'

/**
 * @ignore
 *
 * @param {Iterable | AsyncIterable} iterable An iterable or async iterable object.
 * @param {Function} iteratee A function that will be called with each member of `iterable`. It will receive
 * three arguments:
 *   * `value`: The current value to process
 *   * `index`: The index in the iterable. Will start from 0.
 *   * `iterable`: The iterable on which the operation is being performed.
 * @param {number | Queue} concurrencyOrQueue The maximum number of times iteratee can be called concurrently or
 * a queue.
 * @param {boolean} ordered ignore
 * @returns {*} ignore
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
