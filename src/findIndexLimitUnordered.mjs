
import findInternal from './findInternal.mjs'
import assert from 'nanoassert'

/**
 * @ignore
 * @param {*} iterable ignore
 * @param {*} iteratee ignore
 * @param {*} concurrencyOrQueue ignore
 * @returns {*} ignore
 */
async function findIndexLimitUnordered (iterable, iteratee, concurrencyOrQueue) {
  assert(typeof iteratee === 'function', 'iteratee must be a function')
  const result = (await findInternal(iterable, iteratee, concurrencyOrQueue, false))[0]
  return result
}

export default findIndexLimitUnordered
