
import asyncWrap from './asyncWrap'

/**
 * Immediately calls an asynchronous function and redirects to an error handler if it throws an exception.
 * The error handler is optional, the default one just outputs the error in the console.
 *
 * This function is trivial but useful in the context of node.js when you would like to use await on the root
 * scope. It is also used in most examples provided for this library.
 *
 * @param {Function} fct An asynchronous function to call.
 * @param {Function} errorHandler (Optional) A facultative error handler. This function will receive a single argument:
 * the thrown exception. The default behavior is to output the exception in the console.
 *
 * @example
 * import { asyncRoot } from 'modern-async'
 *
 * // or
 *
 * const { asyncRoot } = require('modern-async')
 *
 * asyncRoot(async () => {
 *   // any code using await
 * }, (e) => {
 *   console.error("An error occured", e)
 *   process.exit(-1)
 * })
 */
async function asyncRoot (fct, errorHandler = null) {
  errorHandler = errorHandler || console.error.bind(console)
  const asyncFct = asyncWrap(fct)
  try {
    await asyncFct()
  } catch (e) {
    errorHandler(e)
  }
}

export default asyncRoot
