
/**
 * A basic class to create a promise with its resolve and reject function in the same object.
 *
 * Instances of this class are never returned by any function but it is used internally.
 *
 * @example
 * import { Deferred, asyncRoot } from 'modern-async'
 *
 * asyncRoot(async () => {
 *   const deferred = new Deferred()
 *
 *   setTimeout(() => {
 *     deferred.resolve('test')
 *   }, 10)
 *
 *   console.log(await deferred.promise) // will wait 10ms before returning 'test'
 * })
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
   * The promise.
   *
   * @member {Promise}
   *
   * @returns {Promise} ignored
   */
  get promise () {
    return this._promise
  }

  /**
   * The resolve function.
   *
   * @member {Function}
   *
   * @returns {Function} The resolve function
   */
  get resolve () {
    return this._resolve
  }

  /**
   * The reject function
   *
   * @member {Function}
   *
   * @returns {Function} The reject function
   */
  get reject () {
    return this._reject
  }
}

export default Deferred
