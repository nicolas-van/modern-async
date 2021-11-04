import assert from 'nanoassert'
import Deferred from './Deferred.mjs'
import asyncWrap from './asyncWrap.mjs'
import CancelledError from './CancelledError.mjs'
import queueMicrotask from './queueMicrotask.mjs'

/**
 * A class representing a queue.
 *
 * Tasks added to the queue are processed in parallel (up to the concurrency limit).
 * If all slots of the queue are occupied, the task is queued until one becomes available.
 * When a slot is freed, the pending task with higher priority is executed. If multiple pending tasks have the same
 * priority the first that was scheduled is executed.
 *
 * Once a task is completed, its corresponding promise is terminated accordingly.
 *
 * @example
 * import { Queue, sleep } from 'modern-async'
 *
 * const queue = new Queue(3) // create a queue with concurrency 3
 *
 * const array = Array.from(Array(100).keys()) // an array of 100 numbers from 0 to 99
 *
 * const promises = []
 * for (const i of array) {
 *   promises.push(queue.exec(async () => {
 *     console.log(`Starting task ${i}`)
 *     await sleep(Math.random() * 10) // waits a random amount of time between 0ms and 10ms
 *     console.log(`Ending task ${i}`)
 *     return i;
 *   }))
 * }
 * const results = await Promise.all(promises)
 * // all the scheduled tasks will perform with a maximum concurrency of 3 and log when they start and stop
 *
 * console.log(results) // will display an array with the result of the execution of each separate task
 */
class Queue {
  /**
   * Constructs a queue with the given concurrency
   *
   * @param {number} concurrency The concurrency of the queue, must be an integer greater than 0 or
   * `Number.POSITIVE_INFINITY`.
   */
  constructor (concurrency) {
    assert(Number.isInteger(concurrency) || concurrency === Number.POSITIVE_INFINITY,
      'concurrency must be an integer or positive infinity')
    assert(concurrency > 0, 'concurrency must be greater than 0')
    this._concurrency = concurrency
    this._iqueue = []
    this._running = 0
    this._checkQueueScheduled = false
  }

  /**
   * (Read-only) The concurrency of the queue.
   *
   * @member {number}
   * @returns {number} ignore
   */
  get concurrency () {
    return this._concurrency
  }

  /**
   * (Read-only) The current number of tasks that are processing.
   *
   * @member {number}
   * @returns {number} ignore
   */
  get running () {
    return this._running
  }

  /**
   * (Read-only) The number of pending tasks.
   *
   * @member {number}
   * @returns {number} ignore
   */
  get pending () {
    return this._iqueue.length - this.running
  }

  /**
   * Puts a task at the end of the queue. When the task is executed and completes the returned promise will be terminated
   * accordingly.
   *
   * @param {Function} fct An asynchronous functions representing the task. It will be executed when the queue has
   * available slots and its result will be propagated to the promise returned by exec().
   * @param {number} [priority] The priority of the task. The higher the priority is, the sooner the task will be
   * executed regarding the priority of other pending tasks. Defaults to 0.
   * @returns {Promise} A promise that will be resolved or rejected once the task has completed. Its state will be the same
   * than the promise returned by the call to `fct`.
   */
  async exec (fct, priority = 0) {
    return this.execCancellable(fct, priority)[0]
  }

  /**
   * Puts a task at the end of the queue. When the task is executed and completes the returned promise will be terminated
   * accordingly.
   *
   * This function returns both a promise and a cancel function. The cancel function allows to cancel the pending task,
   * but only if it wasn't started yet. Calling the cancel function on a task that it already running has no effect.
   * When a task is cancelled its corresponding promise will be rejected with a `CancelledError`.
   *
   * @param {Function} fct An asynchronous functions representing the task. It will be executed when the queue has
   * available slots and its result will be propagated to the promise returned by exec().
   * @param {number} [priority] The priority of the task. The higher the priority is, the sooner the task will be
   * executed regarding the priority of other pending tasks. Defaults to 0.
   * @returns {Array} A tuple with two parameters:
   *   * `promise`: A promise that will be resolved or rejected once the task has completed. Its state will be the same
   *     than the promise returned by the call to `fct`.
   *   * `cancel`: A cancel function. When called it will cancel the task if it is still pending. It has no effect is the
   *     task has already started or already terminated. When a task is cancelled its corresponding promise will be
   *     rejected with a `CancelledError`. If will return `true` if the task was effectively pending and was cancelled,
   *     `false` in any other case.
   */
  execCancellable (fct, priority = 0) {
    assert(typeof fct === 'function', 'fct must be a function')
    assert(typeof priority === 'number', 'priority must be a number')
    const deferred = new Deferred()
    let i = this._iqueue.length
    while (i >= 1) {
      const t = this._iqueue[i - 1]
      if (t.priority >= priority) {
        break
      }
      i -= 1
    }
    const task = {
      asyncFct: asyncWrap(fct),
      deferred,
      priority,
      state: 'pending'
    }
    this._iqueue.splice(i, 0, task)
    this._scheduleCheckQueue()
    return [deferred.promise, () => {
      if (task.state !== 'pending') {
        return false
      } else {
        const filtered = this._iqueue.filter((v) => v !== task)
        assert(filtered.length < this._iqueue.length)
        this._iqueue = filtered
        task.state = 'cancelled'
        deferred.reject(new CancelledError())
        return true
      }
    }]
  }

  /**
   * @ignore
   */
  _scheduleCheckQueue () {
    if (this._checkQueueScheduled) {
      return
    }
    this._checkQueueScheduled = true
    queueMicrotask(() => {
      this._checkQueueScheduled = false
      this._checkQueue()
    })
  }

  /**
   * @ignore
   */
  _checkQueue () {
    while (true) {
      assert(this.running >= 0, 'invalid state')
      assert(this.running <= this.concurrency, 'invalid state')
      if (this.running === this.concurrency) {
        return
      }
      const task = this._iqueue.find((v) => v.state === 'pending')
      if (task === undefined) {
        return
      }
      this._running += 1
      task.state = 'running'
      queueMicrotask(() => {
        task.asyncFct().finally(() => {
          this._running -= 1
          this._iqueue = this._iqueue.filter((v) => v !== task)
        }).then(task.deferred.resolve, task.deferred.reject).then(() => {
          this._scheduleCheckQueue()
        })
      })
    }
  }

  /**
   * Cancels all pending tasks. Their corresponding promises will be rejected with a `CancelledError`. This method will
   * not alter tasks that are already running.
   *
   * @returns {number} The number of pending tasks that were effectively cancelled.
   */
  cancelAllPending () {
    const toCancel = this._iqueue.filter((task) => task.state === 'pending')
    this._iqueue = this._iqueue.filter((task) => task.state !== 'pending')
    toCancel.forEach((task) => {
      task.deferred.reject(new CancelledError())
    })
    return toCancel.length
  }
}

export default Queue
