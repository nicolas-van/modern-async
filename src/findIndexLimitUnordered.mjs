
import Queue from './Queue.mjs'
import asyncGeneratorMap from './asyncGeneratorMap.mjs'
import assert from 'nanoassert'

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
  for await (const [index, pass] of asyncGeneratorMap(iterable, async (value, index, iterable) => {
    return [index, await iteratee(value, index, iterable)]
  }, queue, false)) {
    if (pass) {
      return index
    }
  }
  return -1
}

export default findIndexLimitUnordered
