
import delay from './delay.mjs'
import assert from 'nanoassert'

/**
 * A class used to spread time or cpu intensive operations on multiple tasks in the event loop in order
 * to avoid blocking other tasks that may need to be executed.
 *
 * It is configured with a trigger time, which represents the maximum amount of time your tasks should
 * monopolize the event loop. Choosing an appropriate trigger time is both important and hard. If too low
 * it will impact the performances of your long running algorithm. If too high it will impact the other
 * tasks that need to run in the event loop.
 *
 * When using Delayer your code should contain frequent calls to `await delayer.checkDelay()`, usually
 * at the end of every loop. `checkDelay()` will check the amount of time that ellasped since the last time
 * it triggered a new task in the event loop. If the amount of time is below the trigger time it returns
 * an already resolved promise and the remaining computation will be able to continue processing in a
 * microtask. If not it will call the `delay()` function that will retrigger the operation in a later task
 * of the event loop.
 *
 * @example
 * import { Delayer } from 'modern-async'
 *
 * const delayer = new Delayer(10) // a delayer with 10ms trigger time
 *
 * // some cpu intensive operation that will run for a long time
 * for (let i = 0; i < 100000000; i += 1) {
 *   // some code
 *   await delayer.checkDelay()
 * }
 */
class Delayer {
  /**
   * Constructs a new `Delayer` by specifying its trigger time.
   *
   * @param {number} triggerTime The trigger time.
   */
  constructor (triggerTime) {
    this.triggerTime = triggerTime
    this.reset()
  }

  /**
   * The trigger time of this `Delayer` in milliseconds. The trigger time represent the
   * maximum amount of time before a call to `checkDelay()` decide to schedule a new task in the event loop.
   *
   * @member {number}
   * @returns {number} ignore
   */
  get triggerTime () {
    return this._triggerTime
  }

  /**
   * @ignore
   * @param {number} triggerTime ignore
   */
  set triggerTime (triggerTime) {
    assert(typeof triggerTime === 'number', 'trigger time must be a number')
    this._triggerTime = triggerTime
  }

  /**
   * Resets the internal timer to the current time.
   */
  reset () {
    this._last = new Date().getTime()
  }

  /**
   * Checks if a delay must be applied according to the internal timer. If that's the case this method
   * will call `delay()` and return `true`. If not it will do nothing and return `false`.
   *
   * @returns {boolean} `true` if a new task was scheduled in the event loop, `false` otherwise.
   */
  async checkDelay () {
    const current = new Date().getTime()
    if (current - this._last >= this.triggerTime) {
      await delay()
      this.reset()
      return true
    } else {
      return false
    }
  }
}

export default Delayer
