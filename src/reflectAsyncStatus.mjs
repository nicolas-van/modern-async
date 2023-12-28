
/**
 * Immediately calls an asynchronous function and wraps its result into a promise that
 * can only be resolved, not rejected, regardless of the state of the promised returned
 * by the function.
 *
 * The returned promise will contain an object with the following fields:
 *
 * * `status`: A string, either "fulfilled" or "rejected", indicating the state of the
 *   original promise.
 * * `value`: Only present if status is "fulfilled". The value that the promise was
 *   fulfilled with.
 * * `reason`: Only present if status is "rejected". The reason that the promise was
 *   rejected with.
 *
 * This object structure is similar to the one used by the [`Promise.allSettled()`
 * function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled).
 *
 * This function can be useful to make use of other functions in a fault-tolerant way.
 *
 * @param {Function} fct An asynchronous function
 * @returns {Promise<any>} A promise that will always be resolved with an object containing
 * a snapshot of the original promise state.
 * @example
 * import { reflectAsyncStatus, asyncMap, asyncSleep } from 'modern-async'
 *
 * const array = [1, 2, 3]
 *
 * const result = await asyncMap(array, (v) => reflectAsyncStatus(async () => {
 *   await asyncSleep(10) // waits 10ms
 *   if (v % 2 === 0) { // throws error on some values
 *     throw Error("error")
 *   }
 *   return v
 * }))
 *
 * console.log(result)
 * // prints:
 * // [
 * //   { status: 'fulfilled', value: 1 },
 * //   { status: 'rejected', reason: Error: error },
 * //   { status: 'fulfilled', value: 3 }
 * // ]
 */
async function reflectAsyncStatus (fct) {
  try {
    const res = await fct()
    return {
      status: 'fulfilled',
      value: res
    }
  } catch (e) {
    return {
      status: 'rejected',
      reason: e
    }
  }
}

export default reflectAsyncStatus
