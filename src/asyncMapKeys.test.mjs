
import { expect, test } from '@jest/globals'
import asyncMapKeys from './asyncMapKeys.mjs'

test('asyncMapKeys base', async () => {
  const obj = {
    a: 1,
    b: 2,
    c: 3
  }

  const nobj = await asyncMapKeys(obj, async (v, k, o) => {
    expect(o).toBe(obj)
    return k + 'x'
  })

  expect(nobj).toEqual({
    ax: 1,
    bx: 2,
    cx: 3
  })
})
