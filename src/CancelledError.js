
/**
 * An error type which is used when a promise is cancelled.
 */
export default class CancelledError extends Error {
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
