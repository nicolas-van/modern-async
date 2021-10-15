
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
    const [identifier, state, result] = await Promise.race(waitList.map(([k, v]) => v))
    if (state === 'rejected') {
      throw result
    }
    removeFromWaitList(identifier)
    return [identifier, result]
  }
  const removeFromWaitList = (identifier) => {
    const i = waitList.findIndex(([k, v]) => k === identifier)
    assert(i !== -1)
    waitList.splice(i, 1)
  }
  const scheduledList = []
  const schedule = (value, index) => {
    console.log('initial schedule', index)
    scheduledList.push([value, index, null])
    internalSchedule(value, index)
  }
  const internalSchedule = (value, index) => {
    console.log('effective schedule', index)
    addToWaitList(index, async () => {
      const [p, cancel] = queue.execCancellable(async () => {
        const output = scheduledList.shift()
        assert(output[1] === index)
        console.log('remove from schedule list', index)
        return iteratee(value, index, asyncIterable)
      })
      assert(scheduledList.length > 0 && scheduledList[scheduledList.length - 1][1] === index)
      scheduledList[scheduledList.length - 1][2] = cancel
      return p
    })
  }
  const cancelAllScheduled = () => {
    for (const elem of scheduledList) {
      const index = elem[1]
      const cancel = elem[2]
      console.log('cancel', index)
      assert(cancel)
      removeFromWaitList(index)
    }
  }
  const rescheduleAll = () => {
    for (const elem of scheduledList) {
      const value = elem[0]
      const index = elem[1]
      elem[2] = null
      internalSchedule(value, index)
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
        cancelAllScheduled()
        console.log('yielding', identifier)
        yield result.value
        rescheduleAll()
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
