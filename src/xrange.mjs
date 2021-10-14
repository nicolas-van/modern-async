import assert from 'nanoassert'

/**
 * @ignore
 * @param {*} startOrEnd ignore
 * @param {*} end ignore
 * @param {*} step ignore
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
