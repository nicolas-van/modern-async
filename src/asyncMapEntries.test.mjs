
import { expect, test } from '@jest/globals'
import asyncMapEntries from './asyncMapEntries.mjs'

test('asyncMapEntries base', async () => {
  const obj = {
    a: 1,
    b: 2,
    c: 3
  }

  const nobj = await asyncMapEntries(obj, async (v, k, o) => {
    expect(o).toBe(obj)
    return [k + 'x', v * 2]
  })

  expect(nobj).toEqual({
    ax: 2,
    bx: 4,
    cx: 6
  })
})
