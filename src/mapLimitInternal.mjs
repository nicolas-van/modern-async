
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

  while (true) {
    while (results.length >= 1 && results[0] !== undefined) {
      const result = results.shift()
      lastIndexReturned += 1
      yield result.value
    }
    if (exhausted && lastIndexFetched === lastIndexReturned) {
      return
    }
    if (hasValue) {
      if (queue.running < queue.concurrency) {
        addToWaitList(lastIndexFetched, async () => iteratee(lastValue, lastIndexFetched, asyncIterable))
        hasValue = false
      } else {
        addToWaitList('taskFinished', async () => taskFinished(queue))
      }
    }
    if (!hasValue && !fetching && !exhausted) {
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
    } else if (identifier === 'taskFinished') {
      // nothing to do
    } else { // result
      const index = identifier
      assert(lastIndexReturned < index, 'invalid state')
      results[index - lastIndexReturned - 1] = { value: result }
    }
  }
}

/**
 * @ignore
 * @param {*} queue ignore
 * @returns {*} ignore
 */
async function taskFinished (queue) {
  return new Promise((resolve) => {
    queue.once('taskFinished', resolve)
  })
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
