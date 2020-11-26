
/**
 * Wraps a function call that may be synchronous in a function that
 * is guaranted to be async. This is a stricter version of calling a
 * function and wrapping its result using Promise.resolve() as the new function also
 * handles the case where the original function throws an exception.
 *
 * @param {Function} fct The function to wrap.
 * @returns {Function} The wrapped function.
 */
export default function asyncWrap (fct) {
  return async function () {
    return fct(...arguments)
  }
}
