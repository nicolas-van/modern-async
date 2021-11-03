
import queueMicrotask_ from 'core-js-pure/features/queue-microtask.js'

/**
 * An alternative to standard `queueMicrotask()` function.
 *
 * This is just of mirror of core-js' implementation for compatibility.
 *
 * @param {Function} fct The function to call in a microtask.
 */
function queueMicrotask (fct) {
  queueMicrotask_(fct)
}

export default queueMicrotask
