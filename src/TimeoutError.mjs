
/**
 * An error type which is used when an asynchronous operation takes too much time to perform.
 */
class TimeoutError extends Error {
  /**
   * Constructs a new instance.
   *
   * @param {string} message The error message
   */
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

export default TimeoutError
