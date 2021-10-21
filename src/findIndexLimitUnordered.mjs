
import findInternal from './findInternal.mjs'
import assert from 'nanoassert'
import Queue from './Queue.mjs'

/**
 * @ignore
 * @param {*} iterable ignore
 * @param {*} iteratee ignore
 * @param {*} concurrency ignore
 * @returns {*} ignore
 */
async function findIndexLimitUnordered (iterable, iteratee, concurrency) {
  assert(typeof iteratee === 'function', 'iteratee must be a function')
  const queue = new Queue(concurrency)
  const result = (await findInternal(iterable, iteratee, queue, false))[0]
  return result
}

export default findIndexLimitUnordered
