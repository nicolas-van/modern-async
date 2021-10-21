
import assert from 'nanoassert'
import asyncGeneratorWrap from './asyncGeneratorWrap.mjs'

/**
 * @ignore
 * @param {*} asyncIterable ignore
 * @param {*} iteratee ignore
 * @param {*} queue ignore
 * @param {*} ordered ignore
 * @returns {*} ignore
 */
async function * mapGenerator (asyncIterable, iteratee, queue, ordered = true) {
  assert(typeof iteratee === 'function', 'iteratee must be a function')
  const it = asyncGeneratorWrap(asyncIterable)

  let lastIndexFetched = -1
  let fetching = false
  let exhausted = false

  const waitList = new Map()
  let currentWaitListInternalIdentifier = 0
  const addToWaitList = (identifier, fct) => {
    const waitListIdentifier = currentWaitListInternalIdentifier
    const p = (async () => {
      try {
        return [waitListIdentifier, identifier, 'resolved', await fct()]
      } catch (e) {
        return [waitListIdentifier, identifier, 'rejected', e]
      }
    })()
    waitList.set(waitListIdentifier, [identifier, p])
    currentWaitListInternalIdentifier += 1
  }
  const raceWaitList = async () => {
    while (true) {
      assert(waitList.size >= 1, 'Can not race on empty list')
      const [waitListIdentifier, identifier, state, result] = await Promise.race([...waitList.values()].map(([k, v]) => v))
      removeFromWaitList(waitListIdentifier)
      return [identifier, state, result]
    }
  }
  const removeFromWaitList = (waitListIdentifier) => {
    waitList.delete(waitListIdentifier)
  }

  const scheduledList = []
  const schedule = (value, index) => {
    const task = {
      value,
      index,
      cancel: null
    }
    scheduledList.push(task)
    addToWaitList(task.index, async () => {
      const [p, cancel] = queue.execCancellable(async () => {
        const i = scheduledList.findIndex((el) => el === task)
        assert(i !== -1, 'Couldn\'t find index in scheduledList for removal')
        scheduledList.splice(i, 1)
        return await iteratee(task.value, task.index, asyncIterable)
      })
      assert(task.cancel === null, 'task already has cancel')
      task.cancel = cancel
      return p
    })
  }
  const cancelAllScheduled = () => {
    for (const task of scheduledList) {
      assert(task.cancel, 'task does not have cancel')
      task.cancel()
    }
  }

  let lastIndexReturned = -1
  const results = []

  addToWaitList('next', async () => it.next())
  while (true) {
    const [identifier, state, result] = await raceWaitList()
    if (identifier === 'next') {
      fetching = false
      if (state === 'rejected') {
        lastIndexFetched += 1
        exhausted = true
        const index = ordered ? lastIndexFetched : lastIndexReturned + 1
        assert(index - lastIndexReturned - 1 >= 0, 'invalid index to insert after fetching')
        assert(results[index - lastIndexReturned - 1] === undefined, 'already inserted result after fetching')
        results[index - lastIndexReturned - 1] = { state, index, result }
      } else {
        const { value, done } = result
        if (!done) {
          lastIndexFetched += 1
          const index = lastIndexFetched
          schedule(value, index)
        } else {
          exhausted = true
        }
      }
    } else { // result
      const index = ordered ? identifier : lastIndexReturned + 1
      assert(index - lastIndexReturned - 1 >= 0, 'invalid index to insert after result')
      assert(results[index - lastIndexReturned - 1] === undefined, 'already inserted result after result')
      results[index - lastIndexReturned - 1] = { state, index, result }
    }
    while (results.length >= 1 && results[0] !== undefined) {
      const result = results.shift()
      assert(result.index === lastIndexReturned + 1, 'Invalid returned index')
      if (result.state === 'rejected') {
        cancelAllScheduled()
        throw result.result
      } else {
        yield result.result
      }
      lastIndexReturned += 1
    }
    if (exhausted && lastIndexFetched === lastIndexReturned) {
      return
    }
    if (!fetching && !exhausted) {
      addToWaitList('next', async () => it.next())
      fetching = true
    }
  }
}

export default mapGenerator
