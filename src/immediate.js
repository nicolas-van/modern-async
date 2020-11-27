
import immediateCancellable from './immediateCancellable'

/**
 * A function returning a promise that will be resolved on the next tick of the event loop.
 *
 * This function simply uses setTimeout() internally as it's the most portable solution.
 *
 * @returns {Promise} A promise that will be resolved on the next tick of the event loop.
 */
export default async function immediate () {
  return immediateCancellable()[0]
}
