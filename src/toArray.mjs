
import asyncGeneratorWrap from './asyncGeneratorWrap.mjs'

/**
 * @ignore
 * @param {*} iterable ignore
 * @returns {*} ignore
 */
async function toArray (iterable) {
  const it = asyncGeneratorWrap(iterable)
  const results = []
  for await (const el of it) {
    results.push(el)
  }
  return results
}

export default toArray
