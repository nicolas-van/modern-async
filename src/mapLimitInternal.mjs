
import assert from 'nanoassert'

/**
 * @ignore
 * @param {*} asyncIterable ignore
 * @param {*} iteratee ignore
 * @param {*} queue ignore
 * @returns {*} ignore
 */
async function * mapLimitInternal (asyncIterable, iteratee, queue) {
  assert(typeof iteratee === 'function', 'iteratee must be a function')
  const it = toAsyncGenerator(asyncIterable)

  let lastIndexFetched = -1
  let fetching = false
  let hasValue = false
  let lastValue
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

  let lastIndexReturned = -1
  const results = []
  let running = 0

  while (true) {
    if (!hasValue && !fetching && !exhausted && running < queue.concurrency) {
      addToWaitList('next', async () => it.next())
      fetching = true
    }
    const [identifier, state, result] = await Promise.race(waitList.map(([k, v]) => v))
    const i = waitList.findIndex(([k, v]) => k === identifier)
    waitList.splice(i, 1)
    if (state === 'rejected') {
      throw result
    }
    if (identifier === 'next') {
      const { value, done } = result
      assert(!hasValue, 'invalid state')
      lastValue = value
      fetching = false
      if (!done) {
        hasValue = true
        lastIndexFetched += 1
      } else {
        hasValue = false
        exhausted = true
      }
    } else { // result
      running -= 1
      assert(lastIndexReturned < identifier, 'invalid state')
      results[identifier - lastIndexReturned - 1] = { value: result }
    }
    while (results.length >= 1 && results[0] !== undefined) {
      const result = results.shift()
      lastIndexReturned += 1
      yield result.value
    }
    if (exhausted && lastIndexFetched === lastIndexReturned) {
      return
    }
    if (hasValue) {
      addToWaitList(lastIndexFetched, async () => {
        return queue.exec(async () => iteratee(lastValue, lastIndexFetched, asyncIterable))
      })
      running += 1
      hasValue = false
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

export default mapLimitInternal
