
import filterLimit from './filterLimit'

/**
 * Returns a new array of all the values in iterable which pass an asynchronous truth test. The calls
 * to iteratee will perform in parallel, but the results array will be
 * in the same order than the original.
 *
 * @param {*} iterable An iterable object.
 * @param {Function} iteratee A function that will be called with each member of the iterable and should return a boolean.
 * @returns {Promise} A promise that will be resolved with an Array containing all the values that passed
 * the truth test. This promise will be rejected if any of the iteratee calls throws an exception.
 */
export default async function filter (iterable, iteratee) {
  return filterLimit(iterable, iteratee, Number.POSITIVE_INFINITY)
}
