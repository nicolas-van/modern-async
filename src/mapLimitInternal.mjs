
import assert from 'nanoassert'

/**
 * @ignore
 * @param {*} iterable ignore
 * @param {*} iteratee ignore
 * @param {*} queue ignore
 * @returns {*} ignore
 */
async function mapLimitInternal (iterable, iteratee, queue) {
  assert(typeof iteratee === 'function', 'iteratee must be a function')
  let running = []
  const it = iterable[Symbol.iterator]()
  let i = 0
  const results = []
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
          return [index, 'resolved', await iteratee(el, index, iterable)]
        } catch (e) {
          return [index, 'rejected', e]
        }
      })
      running.push([index, promise])
      i += 1
    }
    if (exhausted && running.length === 0) {
      return results
    }
    const [index, state, result] = await Promise.race(running.map(([i, p]) => p))
    running = running.filter(([i, p]) => i !== index)
    if (state === 'resolved') {
      results[index] = result
    } else { // error
      throw result
    }
  }
}

export default mapLimitInternal
