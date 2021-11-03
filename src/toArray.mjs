
import asyncIterableWrap from './asyncIterableWrap.mjs'

/**
 * @ignore
 * @param {*} iterable ignore
 * @returns {*} ignore
 */
async function toArray (iterable) {
  const it = asyncIterableWrap(iterable)
  const results = []
  for await (const el of it) {
    results.push(el)
  }
  return results
}

export default toArray
