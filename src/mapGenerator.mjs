
import assert from 'nanoassert'
import asyncWrap from './asyncWrap.mjs'
import asyncGeneratorWrap from './asyncGeneratorWrap.mjs'
import getQueue from './getQueue.mjs'

/**
 * @ignore
 * @param {*} asyncIterable ignore
 * @param {*} iteratee ignore
 * @param {*} concurrencyOrQueue ignore
 * @param {*} ordered ignore
 * @returns {*} ignore
 */
async function * mapGenerator (asyncIterable, iteratee, concurrencyOrQueue = Number.POSITIVE_INFINITY, ordered = true) {
  assert(typeof iteratee === 'function', 'iteratee must be a function')
  iteratee = asyncWrap(iteratee)
  const it = asyncGeneratorWrap(asyncIterable)
  const queue = getQueue(concurrencyOrQueue)

  /**
   * @ignore
   */
  class CustomCancelledError extends Error {}

  let lastIndexFetched = -1
  let fetching = false
  let hasFetchedValue = false
  let fetchedValue = null
  let exhausted = false
  let shouldStop = false

  let lastIndexHandled = -1
  const results = []

  const waitList = new Map()
  const addToWaitList = (identifier, fct) => {
    const p = (async () => {
      try {
        return [identifier, 'resolved', await fct()]
      } catch (e) {
        return [identifier, 'rejected', e]
      }
    })()
    assert(!waitList.has('identifier'), 'waitList already contains identifier')
    waitList.set(identifier, p)
  }
  const raceWaitList = async () => {
    while (true) {
      assert(waitList.size >= 1, 'Can not race on empty list')
      const [identifier, state, result] = await Promise.race([...waitList.values()])
      const removed = waitList.delete(identifier)
      assert(removed, 'waitList does not contain identifier')
      if (state === 'rejected' && result instanceof CustomCancelledError) {
        continue
      }
      return
    }
  }

  const scheduledList = new Map()
  const schedule = (index, value) => {
    const task = {
      value,
      index,
      cancel: null,
      state: null
    }
    scheduledList.set(index, task)
    addToWaitList(task.index, async () => {
      const p = queue.exec(async () => {
        if (task.state === 'cancelled') {
          throw new CustomCancelledError()
        }
        assert(task.state === 'scheduled', 'invalid task state')
        const removed = scheduledList.delete(index)
        assert(removed, 'Couldn\'t find index in scheduledList for removal')

        const [state, result] = await iteratee(value, index, asyncIterable)
          .then((r) => ['resolved', r], (e) => ['rejected', e])

        insertInResults(index, value, state, result)
        if (state === 'rejected') {
          shouldStop = true
          cancelAllScheduled(ordered ? index : 0)
        }
      })
      assert(task.cancel === null, 'task already has cancel')
      task.cancel = () => {
        assert(task.state === 'scheduled', 'task should be scheduled')
        task.state = 'cancelled'
      }
      assert(task.state === null, 'task should have no state')
      task.state = 'scheduled'
      return p
    })
  }
  const cancelAllScheduled = (fromIndex) => {
    for (const index of [...scheduledList.keys()].filter((el) => el >= fromIndex)) {
      const task = scheduledList.get(index)
      assert(task.cancel, 'task does not have cancel')
      task.cancel()
      const removed = scheduledList.delete(index)
      assert(removed, 'Couldn\'t find index in scheduledList for removal')
    }
  }
  const fetch = () => {
    fetching = true
    addToWaitList('next', async () => {
      const [state, result] = await it.next().then((r) => ['resolved', r], (e) => ['rejected', e])
      fetching = false
      if (state === 'resolved') {
        const { value, done } = result
        if (!done) {
          lastIndexFetched += 1
          assert(fetchedValue === null, 'fetchedValue should be null')
          fetchedValue = value
          assert(!hasFetchedValue, 'hasFetchedValue should be false')
          hasFetchedValue = true
        } else {
          exhausted = true
        }
      } else {
        exhausted = true
        lastIndexFetched += 1
        const index = lastIndexFetched
        insertInResults(index, undefined, state, result)
        cancelAllScheduled(ordered ? index : 0)
      }
    })
  }

  const insertInResults = (index, value, state, result) => {
    const indexForInsert = ordered ? index : (lastIndexHandled + 1 + results.length)
    assert(indexForInsert - lastIndexHandled - 1 >= 0, 'invalid index to insert')
    assert(results[indexForInsert - lastIndexHandled - 1] === undefined, 'already inserted result')
    results[indexForInsert - lastIndexHandled - 1] = { index, value, state, result }
  }

  fetch()
  while (true) {
    await raceWaitList()
    while (results.length >= 1 && results[0] !== undefined) {
      const result = results.shift()
      lastIndexHandled += 1
      if (result.state === 'rejected') {
        throw result.result
      } else {
        yield result.result
      }
    }
    if (exhausted && lastIndexFetched === lastIndexHandled) {
      return
    }
    if (hasFetchedValue && !shouldStop) {
      schedule(lastIndexFetched, fetchedValue)
      hasFetchedValue = false
      fetchedValue = null
    }
    if (!fetching && !exhausted && !shouldStop) {
      fetch()
    }
  }
}

export default mapGenerator
