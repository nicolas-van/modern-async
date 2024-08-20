
import asyncGeneratorMap from './asyncGeneratorMap.mjs'
import asyncWrap from './asyncWrap.mjs'
import Queue from './Queue.mjs'

async function asyncGroupBy (iterable, iteratee, queueOrConcurrency = 1) {
  interatee = asyncWrap(iteratee)
  const groups = {}
  for await (const [group, value] of asyncGeneratorMap(iterable, async (v, i, it) =>
    {
      const group = await iteratee(v, i, it)
      return [group, v]
    }, queueOrConcurrency))
  {
    if (!(group in groups))
    {
      groups[group] = []
    }
    groups[group].push(value)
  }
  return groups
}
