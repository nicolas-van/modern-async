
import assert from 'assert'

/**
 * Waits the given amount of time
 *
 * @param {number} amount An amount of time in milliseconds
 * @returns {Promise} A promise that will be resolved after the given amount of time
 */
async function wait (amount) {
  assert(typeof amount === 'number')
  return new Promise((resolve) => {
    setTimeout(resolve, amount)
  })
}

export { wait }
