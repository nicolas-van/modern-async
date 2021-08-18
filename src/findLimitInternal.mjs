
import Queue from './Queue.mjs'
import assert from 'nanoassert'

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
  let running = []
  const it = iterable[Symbol.iterator]()
  let i = 0
  let exhausted = false
  while (true) {
    while (!exhausted && queue.running < queue.concurrency) {
      const index = i
      const itval = it.next()
      if (itval.done) {
        exhausted = true
        break
      }
      const el = itval.value
      const promise = queue.exec(async () => {
        try {
          return [index, 'resolved', await iteratee(el, index, iterable), el]
        } catch (e) {
          return [index, 'rejected', e, el]
        }
      })
      running.push([index, promise])
      i += 1
    }
    if (exhausted && running.length === 0) {
      return [-1, undefined]
    }
    const [index, state, result, val] = await Promise.race(running.map(([i, p]) => p))
    running = running.filter(([i, p]) => i !== index)
    if (state === 'resolved') {
      if (result) {
        return [index, val]
      }
    } else { // error
      throw result
    }
  }
}

export default findLimitInternal
