
import asyncFindInternal from './asyncFindInternal.mjs'
import generatorEntries from './generatorEntries.mjs'
import asyncWrap from './asyncWrap.mjs'
import Queue from './Queue.mjs'

/**
 * @param obj
 * @param iteratee
 * @param queueOrConcurrency
 * @param ordered
 */
async function asyncFindKey (obj, iteratee, queueOrConcurrency = 1, ordered = false) {
  iteratee = asyncWrap(iteratee)
  // eslint-disable-next-line no-unused-vars
  const [k, _] = (await asyncFindInternal(generatorEntries(obj), async ([k, v]) => {
    return await iteratee(v, k, obj)
  }, queueOrConcurrency, ordered))[1]
  return k
}

export default asyncFindKey
