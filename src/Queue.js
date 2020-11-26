import assert from 'assert'
import Deferred from './Deferred'
import asyncWrap from './asyncWrap'

/**
 * A class representing a queue. Tasks added to the queue are processed in parallel (up to the concurrency limit).
 * If all workers are in progress, the task is queued until one becomes available. Once a worker completes a task, its
 * corresponding promise is resolved.
 */
export default class Queue {
  /**
   * Constructs a queue with the given concurrency
   *
   * @param {number} concurrency The concurrency of the queue, must be an integer greater than 0 or
   * Number.POSITIVE_INFINITY .
   */
  constructor (concurrency) {
    assert(Number.isInteger(concurrency) || concurrency === Number.POSITIVE_INFINITY)
    assert(concurrency > 0)
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
   * @param {Function} fct An asynchronous functions representing the task. It will be executed when the queue has available slots
   * and its result will be propagated to the promise returned by exec().
   * @returns {Promise} A promise that will be resolved once the task has completed.
   */
  async exec (fct) {
    const deferred = new Deferred()
    this._iqueue.push({
      asyncFct: asyncWrap(fct),
      deferred,
      running: false
    })
    this._checkQueue()
    return deferred.promise
  }

  /**
   * @ignore
   */
  _checkQueue () {
    while (true) {
      assert(this.running >= 0)
      assert(this.running <= this.concurrency)
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
