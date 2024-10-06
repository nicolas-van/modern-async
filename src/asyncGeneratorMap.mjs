
import assert from 'nanoassert'
import asyncWrap from './asyncWrap.mjs'
import asyncIterableWrap from './asyncIterableWrap.mjs'
import getQueue from './getQueue.mjs'
import Queue from './Queue.mjs'
import reflectAsyncStatus from './reflectAsyncStatus.mjs'

/**
 * Produces a an async iterator that will return each value or `iterable` after having processed them through
 * the `iteratee` function.
 *
 * The iterator will perform the calls to `iteratee` in a queue to limit the concurrency of
 * these calls. The iterator will consume values from `iterable` only if slots are available in the
 * queue.
 *
 * If the returned iterator is not fully consumed it will stop consuming new values from `iterable` and scheduling
 * new calls to `iteratee` in the queue, but already scheduled tasks will still be executed.
 *
 * If `iterable` or any of the calls to `iteratee` throws an exception all pending tasks will be cancelled and the
 * returned async iterator will throw that exception.
 *
 * @param {Iterable | AsyncIterable} iterable An iterable or async iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable. It will receive
 * three arguments:
 *   * `value`: The current value to process
 *   * `index`: The index in the iterable. Will start from 0.
 *   * `iterable`: The iterable on which the operation is being performed.
 * @param {Queue | number} [queueOrConcurrency] If a queue is specified it will be used to schedule the calls to
 * `iteratee`. If a number is specified it will be used as the concurrency of a Queue that will be created
 * implicitly for the same purpose. Defaults to `1`.
 * @param {boolean} [ordered] If true the results will be yielded in the same order as in the source
 * iterable, regardless of which calls to iteratee returned first. If false the the results will be yielded as soon
 * as a call to iteratee returned. Defaults to `true`.
 * @yields {any} Each element of `iterable` after processing it through `iteratee`.
 * @example
 * import {asyncGeneratorMap, asyncSleep} from 'modern-async'
 *
 * const iterator = function * () {
 *   for (let i = 0; i < 10000; i += 1) {
 *     yield i
 *   }
 * }
 * const mapIterator = asyncGeneratorMap(iterator(), async (v) => {
 *   await asyncSleep(1000)
 *   return v * 2
 * })
 * for await (const el of mapIterator) {
 *   console.log(el)
 * }
 * // Will print "0", "2", "4", etc... Only one number will be printed per second.
 * // Numbers from `iterator` will be consumed progressively
 */
async function * asyncGeneratorMap (iterable, iteratee, queueOrConcurrency = 1, ordered = true) {
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
    assert(!waitList.has(identifier), 'waitList contains identifier')
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
        if (snapshot.status === 'rejected') {
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
      } else {
        let yielded = false
        try {
          yield result.snapshot.value
          yielded = true
        } finally {
          if (!yielded) {
            await it.return()
          }
        }
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
    if (!fetching && !exhausted && !shouldStop && scheduledCount < queue.concurrency) {
      fetch()
    }
  }
}

export default asyncGeneratorMap
