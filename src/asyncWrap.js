
/**
 * Wraps a function call that may not be asynchronous in a function that
 * is guaranted to be async. This is a stricter version of calling a
 * function and wrapping its result using Promise.resolve() as the new function also
 * handles the case where the true function throws an exception.
 *
 * @param {Function} fct A function that will immediately be called without arguments.
 * @returns {Function} A promise that will be terminated using the result of fct.
 */
export default function asyncWrap (fct) {
  return async function () {
    return fct(...arguments)
  }
}
