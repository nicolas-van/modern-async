
import sleepCancellable from './sleepCancellable.mjs'
import Queue from './Queue.mjs'
import assert from 'nanoassert'
import asyncWrap from './asyncWrap.mjs'
import CancelledError from './CancelledError.mjs'

/**
 * A class implementing a scheduler.
 *
 * It fills the same purpose than setInterval() but its behavior is more adapted to asynchronous
 * tasks. Notably it can limit the concurrency of asynchronous tasks running in parallel.
 *
 * @example
 * import { Scheduler, sleep } from 'modern-async'
 *
 * let i = 0
 * const scheduler = new Scheduler(async () => {
 *   const taskNbr = i
 *   i += 1
 *   console.log(`Starting task ${taskNbr}`)
 *   await sleep(10) // waits 10ms
 *   console.log(`Ending task ${taskNbr}`)
 * }, 100) // a scheduler that triggers every 100ms
 * // the default configuration uses a maximum concurrency of 1 and doesn't allow pending
 * // tasks, which mean that if a task takes more time to complete than the delay it will be skipped
 *
 * scheduler.start() // starts the scheduler
 *
 * await sleep(1000) // waits 1s, during that time the task should trigger ~ 9 times
 *
 * scheduler.stop() // stops the scheduler
 * console.log('Scheduler stopped')
 * // no "Starting task" console message may appear from here but you could still see a
 * // "Stopping task" as there could have a task that started before we stopped the
 * // scheduler
 */
class Scheduler {
  /**
   * Constructs a Scheduler.
   *
   * @param {Function} fct The asynchronous function to call when the scheduler is triggered.
   * @param {number} delay The delay between two triggering of the scheduler, in ms.
   * @param {{startImmediate: boolean, concurrency: number, maxPending: number}} [options] An object that can contain additional options:
   *
   *   * `startImmediate`: If true a new task will be triggered as soon as the start() method is called.
   *     Defaults to ´false`.
   *   * `concurrency`: The maximum number of concurrent tasks. See the `concurrency` attribute. Defaults to 1.
   *   * `maxPending`: The maximum number of pending tasks. See the `maxPending` attribute. Defaults to 0.
   */
  constructor (fct, delay, options = null) {
    options = options || {}
    this._asyncFct = asyncWrap(fct)
    this._delay = delay
    assert(typeof this._delay === 'number', 'delay must be a number')
    assert(this._delay >= 0, 'delay must be greater or equal than 0')
    this._startImmediate = options.startImmediate || false
    assert(typeof this._startImmediate === 'boolean',
      'startImmediate must be a boolean')
    this._maxPending = options.maxPending || 0
    assert(Number.isInteger(this._maxPending) || this._maxPending === Number.POSITIVE_INFINITY,
      'maxPending must be an integer or positive infinity')
    assert(this._maxPending >= 0, 'maxPending must be greater or equal than 0')
    this._queue = new Queue(options.concurrency || 1)
    this._started = false
    this._initialTime = null
    this._nbrTriggering = null
    this._cancelSleep = null
  }

  /**
   * (Read-only) The delay between two triggering of the scheduler, in milliseconds.
   *
   * @member {number}
   * @returns {number} ignore
   */
  get delay () {
    return this._delay
  }

  /**
   * (Read-only) Whether or not a triggering of the task should occur immediately when calling `start()` or not.
   *
   * Defaults to false.
   *
   * @member {boolean}
   * @returns {boolean} ignore
   */
  get startImmediate () {
    return this._startImmediate
  }

  /**
   * (Read-only) The maximum number of asynchronous tasks that can run in parallel.
   *
   * This parameter only matters in the event where some tasks may take more time to execute
   * than the delay. If the concurrency allows it the new task will be run concurrently. If not
   * it may be scheduled to be executed depending on the configuration of the `maxPending` parameter.
   *
   * Defaults to 1.
   *
   * @member {number}
   * @returns {number} ignore
   */
  get concurrency () {
    return this._queue.concurrency
  }

  /**
   * (Read-only) The maximum number of tasks that can be pending.
   *
   * In the event where one of the tasks triggered by the scheduler takes more time to execute than
   * the delay the next task may or may not be run concurrently depending on the configuration of
   * the `concurrency` parameter. If the maximum concurrency was already reached the new task can
   * be scheduled to be executed as soon as the previous task finished.
   *
   * This parameter indicates the maximum amount of tasks that can be pending at any time. If a
   * task should be scheduled and the maximum amount of pending tasks is already reached
   * that new task will be skipped.
   *
   * This behavior helps to prevent cases that would lead to a infinite amount of tasks to be
   * pending. This could happen in extreme cases where the tasks would take systematically more
   * time to execute than the delay.
   *
   * Defaults to 0.
   *
   * @member {number}
   * @returns {number} ignore
   */
  get maxPending () {
    return this._maxPending
  }

  /**
   * (Read-only) Whether or not the scheduler is actually started.
   *
   * @member {boolean}
   * @returns {boolean} ignore
   */
  get started () {
    return this._started
  }

  /**
   * Starts the scheduler.
   *
   * Calling this method can trigger a task immediately depending on the configuration
   * of the `startImmediate` parameter.
   *
   * If this method is called while the scheduler is already started it will have no effect.
   */
  start () {
    if (this.started) {
      return
    }
    assert(this._queue.pending === 0)
    this._started = true

    this._initialTime = new Date().getTime()
    this._nbrTriggering = 0

    if (this.startImmediate) {
      this._triggerTask()
    }

    this._scheduleSleep()
  }

  /**
   * Stops the scheduler.
   *
   * If, for any reason, there were pending tasks in the scheduler they will be cancelled. On the other
   * hand if they are still one or more tasks that are running they will continue to run until they
   * terminate.
   *
   * This method is safe to call in a task if necessary.
   *
   * If this method is called while the scheduler is already stopped it will have no effect.
   */
  stop () {
    if (!this.started) {
      return
    }
    assert(!!this._cancelSleep)
    this._cancelSleep()
    this._cancelSleep = null
    this._queue.cancelAllPending()
    assert(this._queue.pending === 0)
    this._started = false
    this._initialTime = null
    this._nbrTriggering = null
  }

  /**
   * @ignore
   */
  _scheduleSleep () {
    this._nbrTriggering += 1
    const nextTime = this._initialTime + (this.delay * this._nbrTriggering)
    const currentTime = new Date().getTime()
    const [promise, cancel] = sleepCancellable(nextTime - currentTime)
    this._cancelSleep = cancel
    promise.then(() => {
      this._triggerTask()
      this._scheduleSleep()
    }, () => {
      // ignore cancelled sleep
    })
  }

  /**
   * @ignore
   */
  _triggerTask () {
    const reachedMaxConcurrency = this._queue.running === this._queue.concurrency
    const forecastPending = reachedMaxConcurrency ? this._queue.pending + 1 : 0
    if (forecastPending <= this.maxPending) {
      this._queue.exec(this._asyncFct).catch(exceptionHandler)
    }
  }
}

export default Scheduler

const exceptionHandler = (e) => {
  if (e instanceof CancelledError) {
    // ignore
  } else {
    throw e
  }
}

export { exceptionHandler }
