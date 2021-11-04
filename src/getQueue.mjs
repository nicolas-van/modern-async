
import Queue from './Queue.mjs'

/**
 * @ignore
 * @param {*} queueOrConcurrency ignore
 * @returns {*} ignore
 */
function getQueue (queueOrConcurrency) {
  if (typeof queueOrConcurrency === 'number') {
    return new Queue(queueOrConcurrency)
  } else {
    return queueOrConcurrency
  }
}

export default getQueue
