
import QueuePriority from './QueuePriority'

/**
 * A class representing a queue. Tasks added to the queue are processed in parallel (up to the concurrency limit).
 * If all slots of the queue are occupied, the task is queued until one becomes available.
 * When a slot is freed, the first pending task is executed.
 * Once a task is completed, its corresponding promise is terminated accordingly.
 */
export default class Queue {
  /**
   * Constructs a queue with the given concurrency
   *
   * @param {number} concurrency The concurrency of the queue, must be an integer greater than 0 or
   * Number.POSITIVE_INFINITY .
   */
  constructor (concurrency) {
    this._iqueue = new QueuePriority(concurrency)
  }

  /**
   * @returns {number} The concurrency of the queue.
   */
  get concurrency () {
    return this._iqueue.concurrency
  }

  /**
   * @returns {number} The current number of tasks that are processing.
   */
  get running () {
    return this._iqueue.running
  }

  /**
   * @returns {number} The number of pending tasks.
   */
  get pending () {
    return this._iqueue.pending
  }

  /**
   * Puts a task at the end of the queue. When the task is executed and completes the returned promise will be updated
   * accordingly.
   *
   * @param {Function} fct An asynchronous functions representing the task. It will be executed when the queue has
   * available slots and its result will be propagated to the promise returned by exec().
   * @returns {Promise} A promise that will be resolved once the task has completed.
   */
  async exec (fct) {
    return this._iqueue.exec(fct, 0)
  }

  /**
   * Puts a task at the end of the queue. When the task is executed and completes the returned promise will be terminated
   * accordingly.
   *
   * @param {Function} fct An asynchronous functions representing the task. It will be executed when the queue has
   * available slots and its result will be propagated to the promise returned by exec().
   * @returns {Array} A tuple with two parameters:
   *   * A promise that will be resolved once the task has completed.
   *   * A cancel function. When called it will cancel the task if it is still pending. It has no effect is the task has
   *     already started or already terminated. When a task is cancelled its corresponding promise will be rejected with
   *     a CancelledError. If will return true if the task was effectively pending and was cancelled, false in any other
   *     case.
   */
  execCancellable (fct) {
    return this._iqueue.execCancellable(fct, 0)
  }

  /**
   * Cancels all pending tasks. Their corresponding promises will be rejected with a CancelledError. This method will
   * not alter tasks that are already running.
   *
   * @returns {boolean} True if some tasks where effectively cancelled, false in any other case.
   */
  cancelAllPending () {
    return this._iqueue.cancelAllPending()
  }
}
