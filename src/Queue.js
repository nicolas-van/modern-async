
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
    this._pqueue = new QueuePriority(concurrency)
  }

  /**
   * @returns {number} The concurrency of the queue.
   */
  get concurrency () {
    return this._pqueue.concurrency
  }

  /**
   * @returns {number} The current number of tasks that are processing.
   */
  get running () {
    return this._pqueue.running
  }

  /**
   * @returns {number} The number of pending tasks.
   */
  get pending () {
    return this._pqueue.pending
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
    return this._pqueue.exec(fct, 0)
  }
}
