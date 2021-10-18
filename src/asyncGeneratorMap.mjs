
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
    while (true) {
      const [identifier, state, result] = await Promise.race(waitList.map(([k, v]) => v))
      if (state === 'rejected') {
        if (result instanceof CancelledError) {
          continue
        }
        throw result
      }
      removeFromWaitList(identifier)
      return [identifier, result]
    }
  }
  const removeFromWaitList = (identifier) => {
    const i = waitList.findIndex(([k, v]) => k === identifier)
    assert(i !== -1)
    waitList.splice(i, 1)
  }

  const scheduledList = []
  const schedule = (value, index) => {
    scheduledList.push({ value, index, cancel: null, cancelled: null })
    internalSchedule(value, index)
  }
  const internalSchedule = (value, index) => {
    addToWaitList(index, async () => {
      const [p, cancel] = queue.execCancellable(async () => {
        const output = scheduledList.shift()
        assert(output.index === index)
        try {
          return iteratee(value, index, asyncIterable)
        } finally {
          cancelAllScheduled()
        }
      })
      const i = scheduledList.findIndex((el) => el.index === index)
      assert(i !== -1)
      const scheduleObj = scheduledList[i]
      assert(scheduleObj.cancel === null)
      scheduleObj.cancelled = false
      scheduleObj.cancel = cancel
      return p
    })
  }
  const cancelAllScheduled = () => {
    for (const scheduleObj of scheduledList.filter((el) => !el.cancelled)) {
      assert(scheduleObj.cancel)
      assert(scheduleObj.cancel())
      scheduleObj.cancelled = true
      removeFromWaitList(scheduleObj.index)
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
    const [identifier, result] = await raceWaitList()
    if (identifier === 'next') {
      const { value, done } = result
      fetching = false
      if (!done) {
        lastIndexFetched += 1
        schedule(value, lastIndexFetched)
        running += 1
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
        rescheduleAllCancelled()
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

export default asyncGeneratorMap
