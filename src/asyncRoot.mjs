
import asyncWrap from './asyncWrap.mjs'

/**
 * Immediately calls an asynchronous function and redirects to an error handler if it throws an exception.
 * The error handler is optional, the default one just outputs the error in the console.
 *
 * This function is trivial but useful when you can't use top-level await for compatibility reasons.
 *
 * @param {Function} fct An asynchronous function to call.
 * @param {Function} [errorHandler] A facultative error handler. This function will receive a single argument:
 * the thrown exception. The default behavior is to output the exception in the console.
 * @example
 * import { asyncRoot } from 'modern-async'
 *
 * asyncRoot(async () => {
 *   // any code using await
 * }, (e) => {
 *   console.error("An error occured", e)
 *   process.exit(-1)
 * })
 */
async function asyncRoot (fct, errorHandler = null) {
  errorHandler = errorHandler || ((e) => {
    console.error(e)
  })
  const asyncFct = asyncWrap(fct)
  try {
    await asyncFct()
  } catch (e) {
    errorHandler(e)
  }
}

export default asyncRoot
