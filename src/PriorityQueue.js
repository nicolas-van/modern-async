import assert from 'assert'
import Deferred from './Deferred'
import asyncWrap from './asyncWrap'

/**
 * A class representing a queue. Tasks added to the queue are processed in parallel (up to the concurrency limit).
 * If all workers are in progress, the task is queued until one becomes available. Once a worker completes a task, its
 * corresponding promise is resolved.
 */
export default class PriorityQueue {
  /**
   * Constructs a queue with the given concurrency
   *
   * @param {number} concurrency The concurrency of the queue, must be an integer greater than 0 or
   * Number.POSITIVE_INFINITY .
   */
  constructor (concurrency) {
    assert(Number.isInteger(concurrency) || concurrency === Number.POSITIVE_INFINITY, 'concurrency must be an integer or positive infinity')
    assert(concurrency > 0, 'concurrency must be greater than 0')
    this._concurrency = concurrency
    this._iqueue = []
    this._running = 0
  }

  /**
   * @returns {number} The concurrency of the queue.
   */
  get concurrency () {
    return this._concurrency
  }

  /**
   * @returns {number} The current number of tasks that are processing.
   */
  get running () {
    return this._running
  }

  /**
   * @returns {number} The number of pending tasks.
   */
  get pending () {
    return this._iqueue.length - this.running
  }

  /**
   * Puts a task at the end of the queue. When the task is executed and completes the returned promise will be updated
   * accordingly.
   *
   * @param {Function} fct An asynchronous functions representing the task. It will be executed when the queue has
   * available slots and its result will be propagated to the promise returned by exec().
   * @param {number} priority The priority of the task. The higher the priority is, the sooner the task will be
   * executed regarding the priority of other pending tasks.
   * @returns {Promise} A promise that will be resolved once the task has completed.
   */
  async exec (fct, priority) {
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
    this._iqueue.splice(i, 0, {
      asyncFct: asyncWrap(fct),
      deferred,
      running: false,
      priority
    })
    this._checkQueue()
    return deferred.promise
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
      const obj = this._iqueue.find((v) => !v.running)
      if (obj === undefined) {
        return
      }
      const p = obj.asyncFct()
      obj.running = true
      this._running += 1
      p.finally(() => {
        this._running -= 1
        this._iqueue = this._iqueue.filter((v) => v !== obj)
        this._checkQueue()
      }).then(obj.deferred.resolve, obj.deferred.reject)
    }
  }
}
