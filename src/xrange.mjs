import assert from 'nanoassert'

/**
 * A generator returning numbers (positive and/or negative) progressing from start up to, but not
 * including, end.
 *
 * This function aims to be a generator alternative to Lodash's `range()` function and is mostly
 * compatible with it. Its name comes from the `xrange()` function in Python 2. It was included
 * in this library because it seems to be desperatly hard to find a generator implementation of
 * `range()` in JavaScript.
 *
 * @param {number} startOrEnd If only one argument is specified, this is the end and the start is
 * set to 0. If at least two arguments are specified this is the start.
 * @param {number} end The end number, will not be included in the generated numbers.
 * @param {number} step The step to use to generate numbers. If not specified it will be 1 if end > start
 * and -1 otherwise.
 * @example
 * import { xrange } from 'modern-async'
 *
 * [...xrange(4)]
 * // => [0, 1, 2, 3]
 *
 * [...xrange(-4)]
 * // => [0, -1, -2, -3]
 *
 * [...xrange(1, 5)]
 * // => [1, 2, 3, 4]
 *
 * [...xrange(0, 20, 5)]
 * // => [0, 5, 10, 15]
 *
 * [...xrange(0, -4, -1)]
 * // => [0, -1, -2, -3]
 *
 * [...xrange(0)]
 * // => []
 */
function * xrange (startOrEnd, end = undefined, step = undefined) {
  let start
  if (end === undefined) {
    end = startOrEnd
    start = 0
  } else {
    start = startOrEnd
  }
  if (step === undefined) {
    step = end >= start ? 1 : -1
  }
  assert(typeof start === 'number', 'start must be a number')
  assert(typeof end === 'number', 'start must be a number')
  assert(typeof step === 'number', 'start must be a number')
  assert(step !== 0, 'Invalidly configured xrange(), step can\'t be 0')
  if (end === start) {
    return
  }
  const sense = end > start ? 1 : -1
  const stepSense = step > 0 ? 1 : -1
  assert(sense === stepSense, 'Invalidly configured xrange(), start is not evolving to end')
  let current = start
  while (sense > 0 ? current < end : current > end) {
    yield current
    current += step
  }
}

export default xrange
