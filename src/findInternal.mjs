
import mapGenerator from './mapGenerator.mjs'
import assert from 'nanoassert'

/**
 * @ignore
 * @param {*} asyncIterable ignore
 * @param {*} iteratee ignore
 * @param {*} concurrencyOrQueue ignore
 * @param {*} ordered ignore
 * @returns {*} ignore
 */
async function findInternal (asyncIterable, iteratee, concurrencyOrQueue, ordered = true) {
  assert(typeof iteratee === 'function', 'iteratee must be a function')
  for await (const [index, value, pass] of mapGenerator(asyncIterable, async (value, index, iterable) => {
    return [index, value, await iteratee(value, index, iterable)]
  }, concurrencyOrQueue)) {
    if (pass) {
      return [index, value]
    }
  }
  return [-1, undefined]
}

export default findInternal
