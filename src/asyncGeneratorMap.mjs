
import assert from 'nanoassert'

/**
 * @ignore
 * @param {*} asyncIterable ignore
 * @param {*} iteratee ignore
 * @param {*} queue ignore
 * @param {*} ordered ignore
 * @returns {*} ignore
 */
async function * asyncGeneratorMap (asyncIterable, iteratee, queue, ordered = true) {
  assert(typeof iteratee === 'function', 'iteratee must be a function')
  const it = toAsyncGenerator(asyncIterable)

  let lastIndexFetched = -1
  let fetching = false
  let exhausted = false

  const waitList = []
  const addToWaitList = (identifier, fct) => {
    const p = (async () => {
      try {
        return [identifier, 'resolved', await fct()]
      } catch (e) {
        return [identifier, 'rejected', e]
      }
    })()
    waitList.push([identifier, p])
  }
  const raceWaitList = async () => {
    const [identifier, state, result] = await Promise.race(waitList.map(([k, v]) => v))
    if (state === 'rejected') {
      throw result
    }
    const i = waitList.findIndex(([k, v]) => k === identifier)
    assert(i !== -1)
    waitList.splice(i, 1)
    return [identifier, result]
  }

  let lastIndexReturned = -1
  const results = []
  let running = 0

  addToWaitList('next', async () => it.next())
  while (true) {
    const [identifier, result] = await raceWaitList()
    if (identifier === 'next') {
      const { value, done } = result
      fetching = false
      if (!done) {
        lastIndexFetched += 1
        running += 1
        addToWaitList(lastIndexFetched, async () => {
          return queue.exec(async () => iteratee(value, lastIndexFetched, asyncIterable))
        })
      } else {
        exhausted = true
      }
    } else { // result
      running -= 1
      if (ordered) {
        assert(lastIndexReturned < identifier, 'invalid state')
        results[identifier - lastIndexReturned - 1] = { value: result }
      } else {
        results.push({ value: result })
      }
      while (results.length >= 1 && results[0] !== undefined) {
        const result = results.shift()
        lastIndexReturned += 1
        yield result.value
      }
    }
    if (!fetching && !exhausted && running < queue.concurrency) {
      addToWaitList('next', async () => it.next())
      fetching = true
    }
    if (exhausted && lastIndexFetched === lastIndexReturned) {
      return
    }
  }
}

/**
 * @ignore
 * @param {*} iterator ignore
 * @returns {*} ignore
 */
async function * toAsyncGenerator (iterator) {
  for await (const el of iterator) {
    yield el
  }
}

export default asyncGeneratorMap
