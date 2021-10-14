
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
async function findLimitInternal (iterable, iteratee, concurrency) {
  assert(typeof iteratee === 'function', 'iteratee must be a function')
  const queue = new Queue(concurrency)
  for await (const [index, value, pass] of asyncGeneratorMap(iterable, async (value, index, iterable) => {
    return [index, value, await iteratee(value, index, iterable)]
  }, queue, false)) {
    if (pass) {
      return [index, value]
    }
  }
  return [-1, undefined]
}

export default findLimitInternal
