
/**
 * @ignore
 * @param {*} iterator ignore
 * @returns {*} ignore
 */
async function * asyncGeneratorWrap (iterator) {
  for await (const el of iterator) {
    yield el
  }
}

export default asyncGeneratorWrap
