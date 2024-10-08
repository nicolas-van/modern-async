
import asyncGeneratorMap from './asyncGeneratorMap.mjs'
import asyncWrap from './asyncWrap.mjs'
import Queue from './Queue.mjs'

/**
 * @param iterable
 * @param iteratee
 * @param queueOrConcurrency
 */
async function asyncGroupBy (iterable, iteratee, queueOrConcurrency = 1) {
  iteratee = asyncWrap(iteratee)
  const groups = {}
  for await (const [group, value] of asyncGeneratorMap(iterable, async (v, i, it) => {
    const group = await iteratee(v, i, it)
    return [group, v]
  }, queueOrConcurrency)) {
    if (!(group in groups)) {
      groups[group] = []
    }
    groups[group].push(value)
  }
  return groups
}

export default asyncGroupBy
