
import Queue from './Queue.mjs'

/**
 * @ignore
 * @param {*} concurrencyOrQueue ignore
 * @returns {*} ignore
 */
function getQueue (concurrencyOrQueue) {
  if (typeof concurrencyOrQueue === 'number') {
    return new Queue(concurrencyOrQueue)
  } else {
    return concurrencyOrQueue
  }
}

export default getQueue
