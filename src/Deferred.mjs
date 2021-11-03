
/**
 * A basic class to create a promise with its resolve and reject function in the same object.
 *
 * Instances of this class are never returned by any function of this library but it is used
 * internally and can be useful to code other asynchronous helpers.
 *
 * @example
 * import { Deferred, sleep } from 'modern-async'
 *
 * const deferred = new Deferred()
 *
 * sleep(10).then(() => {
 *   deferred.resolve('test')
 * })
 *
 * console.log(await deferred.promise) // will wait 10ms before printing 'test'
 */
class Deferred {
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
   * (Read-only) The promise.
   *
   * @member {Promise}
   * @returns {Promise} ignored
   */
  get promise () {
    return this._promise
  }

  /**
   * (Read-only) The resolve function.
   *
   * @member {Function}
   * @returns {Function} The resolve function
   */
  get resolve () {
    return this._resolve
  }

  /**
   * (Read-only) The reject function
   *
   * @member {Function}
   * @returns {Function} The reject function
   */
  get reject () {
    return this._reject
  }
}

export default Deferred
