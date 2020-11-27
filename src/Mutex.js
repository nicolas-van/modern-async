
import MutexPriority from './MutexPriority'

/**
 * A class representing a mutex. It allows to run tasks in mutual exclusion, which
 * means only one task can be executed at a time.
 *
 * It is equivalent to a Queue with a concurrency of 1.
 */
export default class Mutex {
  /**
   * Constructs a Mutex.
   */
  constructor () {
    this._iqueue = new MutexPriority()
  }

  /**
   * @returns {boolean} Whether or not there is actually a task running.
   */
  get locked () {
    return this._iqueue.locked
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
