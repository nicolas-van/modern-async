
import { expect, test } from '@jest/globals'
import asyncMapValues from './asyncMapValues.mjs'

test('asyncMapValues base', async () => {
  const obj = {
    a: 1,
    b: 2,
    c: 3
  }

  const nobj = await asyncMapValues(obj, async (v, k, o) => {
    expect(o).toBe(obj)
    return v * 2
  })

  expect(nobj).toEqual({
    a: 2,
    b: 4,
    c: 6
  })
})
