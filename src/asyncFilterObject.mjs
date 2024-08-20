
import Queue from './Queue.mjs'
import asyncFromEntries from './asyncFromEntries.mjs'
import asyncGeneratorFilter from './asyncGeneratorFilter.mjs'
import generatorEntries from './generatorEntries.mjs'
import asyncWrap from './asyncWrap.mjs'

/**
 * @param obj
 * @param iteratee
 * @param queueOrConcurrency
 */
async function asyncFilterObject (obj, iteratee, queueOrConcurrency = 1) {
  iteratee = asyncWrap(iteratee)
  return await asyncFromEntries(asyncGeneratorFilter(generatorEntries(obj), async ([k, v]) => {
    return await iteratee(v, k, obj)
  }, queueOrConcurrency))
}

export default asyncFilterObject
