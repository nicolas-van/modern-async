
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
    scheduledList.push({ value, index, cancel: null, cancelled: null })
    internalSchedule(value, index)
  }
  const internalSchedule = (value, index) => {
    addToWaitList(index, async () => {
      const [p, cancel] = queue._execCancellableInternal(async () => {
        const i = scheduledList.findIndex((el) => el.index === index)
        assert(i !== -1, 'Couldn\'t find index in scheduledList for removal')
        scheduledList.splice(i, 1)
        try {
          return iteratee(value, index, asyncIterable)
        } finally {
          cancelAllScheduled()
        }
      }, 0, CustomCancelledError)
      const i = scheduledList.findIndex((el) => el.index === index)
      assert(i !== -1, 'Couldn\'t find index in scheduledList for cancel update')
      const scheduleObj = scheduledList[i]
      assert(scheduleObj.cancel === null, 'scheduleObj already has cancel')
      scheduleObj.cancelled = false
      scheduleObj.cancel = cancel
      return p
    })
  }
  const cancelAllScheduled = () => {
    for (const scheduleObj of scheduledList.filter((el) => !el.cancelled)) {
      assert(scheduleObj.cancel, 'scheduleObj does not have cancel')
      assert(scheduleObj.cancel(), 'task was already cancelled')
      scheduleObj.cancelled = true
    }
  }
  const rescheduleAllCancelled = () => {
    for (const scheduleObj of scheduledList.filter((el) => el.cancelled)) {
      scheduleObj.cancel = null
      internalSchedule(scheduleObj.value, scheduleObj.index)
    }
  }

  let lastIndexReturned = -1
  const results = []
  let running = 0

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
          schedule(value, lastIndexFetched)
          running += 1
        } else {
          exhausted = true
        }
      }
    } else { // result
      running -= 1
      const index = ordered ? identifier : lastIndexReturned + 1
      assert(index > lastIndexReturned, 'invalid index to insert after result')
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
    if (!fetching && !exhausted && running < queue.concurrency) {
      addToWaitList('next', async () => it.next())
      fetching = true
    }
    if (exhausted && lastIndexFetched === lastIndexReturned) {
      return
    }
    rescheduleAllCancelled()
  }
}

export default asyncGeneratorMap
