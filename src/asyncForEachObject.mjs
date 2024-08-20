
import asyncGeneratorMap from './asyncGeneratorMap.mjs'
import generatorEntries from './generatorEntries.mjs'
import Queue from './Queue.mjs'

async function asyncForEachObject (obj, iteratee, queueOrConcurrency = 1) {
  iteratee = asyncWrap(iteratee)
  // eslint-disable-next-line no-unused-vars
  for await (const _el of asyncGeneratorMap(generatorEntries(obj), async ([k, v]) => {
    await iteratee(v, k, obj)
  }, queueOrConcurrency, false)) {
    // do nothing
  }
}

export default asyncForEachObject
