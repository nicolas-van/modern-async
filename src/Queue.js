import assert from 'assert'
import Deferred from './Deferred'
import asyncWrap from './asyncWrap'
import CancelledError from './CancelledError'
import delay from './delay'

/**
 * A class representing a queue. Tasks added to the queue are processed in parallel (up to the concurrency limit).
 * If all slots of the queue are occupied, the task is queued until one becomes available.
 * When a slot is freed, the pending task with higher priority is executed. If multiple pending tasks have the same
 * priority the first that was scheduled is executed.
 * Once a task is completed, its corresponding promise is terminated accordingly.
 */
export default class QueuePriority {
  /**
   * Constructs a priority queue with the given concurrency
   *
   * @param {number} concurrency The concurrency of the queue, must be an integer greater than 0 or
   * Number.POSITIVE_INFINITY .
   */
  constructor (concurrency) {
    assert(Number.isInteger(concurrency) || concurrency === Number.POSITIVE_INFINITY,
      'concurrency must be an integer or positive infinity')
    assert(concurrency > 0, 'concurrency must be greater than 0')
    if (concurrency !== Number.POSITIVE_INFINITY) {
      this._queue = new _InternalQueuePriority(concurrency)
    } else {
      this._queue = new _InternalInfinityQueue()
    }
  }

  /**
   * @returns {number} The concurrency of the queue.
   */
  get concurrency () {
    return this._queue.concurrency
  }

  /**
   * @returns {number} The current number of tasks that are processing.
   */
  get running () {
    return this._queue.running
  }

  /**
   * @returns {number} The number of pending tasks.
   */
  get pending () {
    return this._queue.pending
  }

  /**
   * Puts a task at the end of the queue. When the task is executed and completes the returned promise will be terminated
   * accordingly.
   *
   * @param {Function} fct An asynchronous functions representing the task. It will be executed when the queue has
   * available slots and its result will be propagated to the promise returned by exec().
   * @param {number} priority (Optional) The priority of the task. The higher the priority is, the sooner the task will be
   * executed regarding the priority of other pending tasks. Defaults to 0.
   * @returns {Promise} A promise that will be resolved once the task has completed.
   */
  async exec (fct, priority = 0) {
    return this._queue.exec(fct, priority)
  }

  /**
   * Puts a task at the end of the queue. When the task is executed and completes the returned promise will be terminated
   * accordingly.
   *
   * @param {Function} fct An asynchronous functions representing the task. It will be executed when the queue has
   * available slots and its result will be propagated to the promise returned by exec().
   * @param {number} priority (Optional) The priority of the task. The higher the priority is, the sooner the task will be
   * executed regarding the priority of other pending tasks. Defaults to 0.
   * @returns {Array} A tuple with two parameters:
   *   * A promise that will be resolved once the task has completed.
   *   * A cancel function. When called it will cancel the task if it is still pending. It has no effect is the task has
   *     already started or already terminated. When a task is cancelled its corresponding promise will be rejected with
   *     a CancelledError. If will return true if the task was effectively pending and was cancelled, false in any other
   *     case.
   */
  execCancellable (fct, priority = 0) {
    return this._queue.execCancellable(fct, priority)
  }

  /**
   * Cancels all pending tasks. Their corresponding promises will be rejected with a CancelledError. This method will
   * not alter tasks that are already running.
   *
   * @returns {boolean} True if some tasks where effectively cancelled, false in any other case.
   */
  cancelAllPending () {
    return this._queue.cancelAllPending()
  }
}

/**
 * @ignore
 */
class _InternalQueuePriority {
  /**
   * @ignore
   *
   * @param {number} concurrency ignore
   */
  constructor (concurrency) {
    this._concurrency = concurrency
    this._iqueue = []
    this._running = 0
  }

  /**
   * @ignore
   * @returns {number} ignore
   */
  get concurrency () {
    return this._concurrency
  }

  /**
   * @ignore
   * @returns {number} ignore
   */
  get running () {
    return this._running
  }

  /**
   * @ignore
   * @returns {number} ignore
   */
  get pending () {
    return this._iqueue.length - this.running
  }

  /**
   * @ignore
   *
   * @param {*} fct ignored
   * @param {*} priority ignored
   * @returns {*} ignored
   */
  async exec (fct, priority) {
    return this.execCancellable(fct, priority)[0]
  }

  /**
   * @ignore
   * @param {*} fct ignore
   * @param {*} priority ignore
   * @returns {*} ignore
   */
  execCancellable (fct, priority) {
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
      running: false,
      priority
    }
    this._iqueue.splice(i, 0, task)
    this._checkQueue()
    return [deferred.promise, () => {
      if (task.running) {
        return false
      } else {
        const filtered = this._iqueue.filter((v) => v !== task)
        if (filtered.length < this._iqueue.length) {
          this._iqueue = filtered
          deferred.reject(new CancelledError())
          return true
        } else {
          return false
        }
      }
    }]
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
      const task = this._iqueue.find((v) => !v.running)
      if (task === undefined) {
        return
      }
      task.running = true
      this._running += 1
      task.asyncFct().finally(() => {
        this._running -= 1
        this._iqueue = this._iqueue.filter((v) => v !== task)
        // the following check is delayed to give the opportunity to components
        // listening for promises to cancel pending promises before they are
        // started
        delay().then(() => {
          this._checkQueue()
        })
      }).then(task.deferred.resolve, task.deferred.reject)
    }
  }

  /**
   * @ignore
   * @returns {*} ignore
   */
  cancelAllPending () {
    const toCancel = this._iqueue.filter((task) => !task.running)
    this._iqueue = this._iqueue.filter((task) => task.running)
    toCancel.forEach((task) => {
      task.deferred.reject(new CancelledError())
    })
    return toCancel.length >= 1
  }
}

/**
 * @ignore
 */
class _InternalInfinityQueue {
  /**
   * @ignore
   */
  constructor () {
    this._running = 0
  }

  /**
   * @ignore
   * @returns {number} ignore
   */
  get concurrency () {
    return Number.POSITIVE_INFINITY
  }

  /**
   * @ignore
   * @returns {number} ignore
   */
  get running () {
    return this._running
  }

  /**
   * @ignore
   * @returns {number} ignore
   */
  get pending () {
    return 0
  }

  /**
   * @ignore
   *
   * @param {Function} fct ignore
   * @returns {Promise} ignore
   */
  async exec (fct) {
    return this.execCancellable(fct)[0]
  }

  /**
   * @ignore
   *
   * @param {*} fct ignore
   * @returns {*} ignore
   */
  execCancellable (fct) {
    this._running += 1
    const asyncFct = asyncWrap(fct)
    const p = asyncFct()
    return [p.finally(() => {
      this._running -= 1
    }), () => false]
  }

  /**
   * @ignore
   * @returns {*} ignore
   */
  cancelAllPending () {
    return false
  }
}
