
import assert from 'nanoassert'
import asyncGeneratorWrap from './asyncGeneratorWrap.mjs'
import CancelledError from './CancelledError.mjs'

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
  const it = asyncGeneratorWrap(asyncIterable)

  /**
   * @ignore
   */
  class CustomCancelledError extends CancelledError {}

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
    waitList.set(waitListIdentifier, p)
    currentWaitListInternalIdentifier += 1
  }
  const raceWaitList = async () => {
    while (true) {
      assert(waitList.size >= 1, 'Can not race on empty list')
      const [waitListIdentifier, identifier, state, result] = await Promise.race(waitList.values())
      removeFromWaitList(waitListIdentifier)
      if (state === 'rejected' && result instanceof CustomCancelledError) {
        continue
      }
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
      cancel: null,
      state: null
    }
    scheduledList.push(task)
    internalSchedule(task)
  }
  const internalSchedule = (task) => {
    addToWaitList(task.index, async () => {
      const p = queue.exec(async () => {
        assert(task.state === 'scheduled' || task.state === 'cancelled', 'invalid task state')
        if (task.state === 'scheduled') {
          const i = scheduledList.findIndex((el) => el === task)
          assert(i !== -1, 'Couldn\'t find index in scheduledList for removal')
          scheduledList.splice(i, 1)
          try {
            return iteratee(task.value, task.index, asyncIterable)
          } finally {
            finalizedTask()
          }
        } else { // cancelled
          throw new CustomCancelledError()
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
  const cancelAllScheduled = () => {
    for (const task of scheduledList.filter((el) => el.state === 'scheduled')) {
      assert(task.cancel, 'task does not have cancel')
      task.cancel()
    }
  }
  const rescheduleAllCancelled = () => {
    for (const task of scheduledList.filter((el) => el.state === 'cancelled')) {
      const i = scheduledList.findIndex((el) => el === task)
      assert(i !== -1, 'Couldn\'t find index in scheduledList for removal')
      scheduledList.splice(i, 1)
      schedule(task.value, task.index)
    }
  }
  let finalizedCount = 0
  const finalizedTask = (task) => {
    assert(finalizedCount >= 0, 'invalid finalized count in finalizedTask')
    finalizedCount += 1
    cancelAllScheduled()
  }

  let lastIndexReturned = -1
  const results = []
  const fetchedList = []

  addToWaitList('next', async () => it.next())
  while (true) {
    const [identifier, state, result] = await raceWaitList()
    if (identifier === 'next') {
      fetching = false
      if (state === 'rejected') {
        lastIndexFetched += 1
        exhausted = true
        const index = ordered ? lastIndexFetched : lastIndexReturned + 1
        assert(index > lastIndexReturned, 'invalid index to insert after result')
        results[index - lastIndexReturned - 1] = { state, index, result }
      } else {
        const { value, done } = result
        if (!done) {
          lastIndexFetched += 1
          const index = lastIndexFetched
          fetchedList.push({ index, value })
        } else {
          exhausted = true
        }
      }
    } else { // result
      const index = ordered ? identifier : lastIndexReturned + 1
      assert(index > lastIndexReturned, 'invalid index to insert after result')
      results[index - lastIndexReturned - 1] = { state, index, result }
      assert(finalizedCount >= 1, 'invalid finalized count')
      finalizedCount -= 1
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
    if (finalizedCount === 0) {
      while (fetchedList.length >= 1) {
        const { index, value } = fetchedList.shift()
        schedule(value, index)
      }
      rescheduleAllCancelled()
      if (!fetching && !exhausted) {
        addToWaitList('next', async () => it.next())
        fetching = true
      }
    }
  }
}

export default asyncGeneratorMap
