
/**
 * An alternative to standard `Object.entries()` function, but returning an iterable
 * returning each key-value pair in the object.
 *
 * Using this function is more memory efficient than using `Object.entries()` when iterating
 * over objects key-value pairs in the case of big objects.
 *
 * @param {object} obj The object to iterate over key-value pairs.
 * @yields {Array} Each key-value pair in the object as a tuple of two objects:
 *   * The key
 *   * The value
 * @example
 * import { generatorEntries } from 'modern-async'
 *
 * const obj = {
 *   a: 1,
 *   b: 2,
 *   c: 3
 * }
 *
 * const it = generatorEntries(obj)
 *
 * for (const [key, value] of it)
 * {
 *   console.log(key, value)
 * }
 * // prints:
 * // "a" 1
 * // "b" 2
 * // "c" 3
 */
function * generatorEntries (obj) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      yield [key, obj[key]]
    }
  }
}

export default generatorEntries
