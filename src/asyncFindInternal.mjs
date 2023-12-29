
import assert from 'nanoassert'
import asyncWrap from './asyncWrap.mjs'
import asyncIterableWrap from './asyncIterableWrap.mjs'
import getQueue from './getQueue.mjs'
import reflectAsyncStatus from './reflectAsyncStatus.mjs'

/**
 * @ignore
 * @param {*} iterable ignore
 * @param {*} iteratee ignore
 * @param {*} queueOrConcurrency ignore
 * @param {*} ordered ignore
 * @returns {*} ignore
 */
async function asyncFindInternal (iterable, iteratee, queueOrConcurrency, ordered) {
  assert(typeof iteratee === 'function', 'iteratee must be a function')
  iteratee = asyncWrap(iteratee)
  const it = asyncIterableWrap(iterable)
  const queue = getQueue(queueOrConcurrency)

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

  let waitListIndex = 0
  const waitList = new Map()
  const addToWaitList = (fct) => {
    const identifier = waitListIndex
    waitListIndex += 1
    const p = (async () => {
      return [identifier, await reflectAsyncStatus(fct)]
    })()
    assert(!waitList.has(identifier), 'waitList already contains identifier')
    waitList.set(identifier, p)
  }
  const raceWaitList = async () => {
    assert(waitList.size >= 1, 'Can not race on empty list')
    const [identifier] = await Promise.race([...waitList.values()])
    const removed = waitList.delete(identifier)
    assert(removed, 'waitList does not contain identifier')
  }

  let scheduledCount = 0
  const scheduledList = new Map()
  const schedule = (index, value) => {
    scheduledCount += 1
    const task = {
      value,
      index,
      cancel: null,
      state: null
    }
    scheduledList.set(index, task)
    addToWaitList(async () => {
      const p = queue.exec(async () => {
        if (task.state === 'cancelled') {
          throw new CustomCancelledError()
        }
        assert(task.state === 'scheduled', 'invalid task state')
        const removed = scheduledList.delete(index)
        assert(removed, 'Couldn\'t find index in scheduledList for removal')

        const snapshot = await reflectAsyncStatus(() => iteratee(value, index, iterable))

        scheduledCount -= 1
        insertInResults(index, value, snapshot)
        if (snapshot.status === 'rejected' || (snapshot.status === 'fulfilled' && snapshot.value)) {
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
    addToWaitList(async () => {
      const snapshot = await reflectAsyncStatus(() => it.next())
      fetching = false
      if (snapshot.status === 'fulfilled') {
        const { value, done } = snapshot.value
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
        insertInResults(index, undefined, snapshot)
        cancelAllScheduled(ordered ? index : 0)
      }
    })
  }

  const insertInResults = (index, value, snapshot) => {
    if (ordered) {
      assert(index - lastIndexHandled - 1 >= 0, 'invalid index to insert')
      assert(results[index - lastIndexHandled - 1] === undefined, 'already inserted result')
      results[index - lastIndexHandled - 1] = { index, value, snapshot }
    } else {
      results.push({ index, value, snapshot })
    }
  }

  fetch()
  while (true) {
    await raceWaitList()
    while (results.length >= 1 && results[0] !== undefined) {
      const result = results.shift()
      lastIndexHandled += 1
      if (result.snapshot.status === 'rejected') {
        throw result.snapshot.reason
      } else if (result.snapshot.value) {
        return [result.index, result.value]
      }
    }
    if (exhausted && lastIndexFetched === lastIndexHandled) {
      return [-1, undefined]
    }
    if (hasFetchedValue && !shouldStop) {
      schedule(lastIndexFetched, fetchedValue)
      hasFetchedValue = false
      fetchedValue = null
    }
    if (!fetching && !exhausted && !shouldStop && scheduledCount < queue.concurrency) {
      fetch()
    }
  }
}

export default asyncFindInternal
