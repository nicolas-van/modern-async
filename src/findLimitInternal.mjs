
import Queue from './Queue.mjs'
import assert from 'nanoassert'
import CancelledError from './CancelledError.mjs'

/**
 * @ignore
 * @param {*} iterable ignore
 * @param {*} iteratee ignore
 * @param {*} concurrency ignore
 * @returns {*} ignore
 */
async function findLimitInternal (iterable, iteratee, concurrency) {
  assert(typeof iteratee === 'function', 'iteratee must be a function')
  const queue = new Queue(concurrency)
  queue._cancelledErrorClass = CustomCancelledError
  const promises = []
  let current = promises
  let finalized = false
  const finalize = () => {
    if (!finalized) {
      current.forEach((p) => {
        p.catch(() => {
          // ignore the exception
        })
      })
      queue.cancelAllPending()
    }
    finalized = true
  }
  let i = 0
  for (const el of iterable) {
    const index = i
    promises.push((async () => {
      try {
        const gres = await queue.exec(async () => {
          try {
            const res = await iteratee(el, index, iterable)
            if (res) {
              finalize()
            }
            return res
          } catch (e) {
            finalize()
            throw e
          }
        })
        return [index, 'resolved', gres, el]
      } catch (e) {
        return [index, 'rejected', e, null]
      }
    })())
    i += 1
  }

  try {
    while (current.length > 0) {
      const [index, state, result, val] = await Promise.race(current)
      if (state === 'resolved') {
        if (result) {
          return [index, val]
        }
      } else { // error
        if (!(result instanceof CustomCancelledError)) {
          throw result
        }
      }
      promises[index] = null
      current = promises.filter((p) => p !== null)
    }
    return [-1, undefined]
  } finally {
    finalize()
  }
}

/**
 * @ignore
 */
class CustomCancelledError extends CancelledError {}

export default findLimitInternal
