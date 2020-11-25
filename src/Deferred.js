
/**
 * A basic class used internally to create a promise with its resolve and reject function
 * in the same object.
 */
export default class Deferred {
  /**
   * Constructs a deferred object.
   */
  constructor () {
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })
  }

  /**
   * @returns {Promise} The promise
   */
  get promise () {
    return this._promise
  }

  /**
   * @returns {Function} The resolve function
   */
  get resolve () {
    return this._resolve
  }

  /**
   * @returns {Function} The reject function
   */
  get reject () {
    return this._reject
  }
}
