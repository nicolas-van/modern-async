
import delayCancellable from './delayCancellable'

/**
 * A function returning a promise that will be resolved in a later tick of the event loop.
 *
 * This function simply uses setTimeout() internally as it's the most portable solution.
 *
 * @returns {Promise} A promise that will be resolved on a later tick of the event loop.
 */
export default async function delay () {
  return delayCancellable()[0]
}
