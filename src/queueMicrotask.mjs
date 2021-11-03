
import queueMicrotask_ from 'core-js-pure/features/queue-microtask.js'

/**
 * An alternative to standard `queueMicrotask()` function.
 *
 * This is just of mirror of core-js' implementation for compatibility.
 *
 * @param {Function} fct The function to call in a microtask.
 * @example
 * import { queueMicrotask } from 'modern-async'
 *
 * queueMicrotask(() => {
 *   console.log('this resolves in a micro task')
 * })
 */
function queueMicrotask (fct) {
  queueMicrotask_(fct)
}

export default queueMicrotask
