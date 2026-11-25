import { expect, test } from '@jest/globals'
import asyncFilterObject from './asyncFilterObject.mjs'

test('asyncFilterObject base', async () => {
  const obj = {
    a: 1,
    b: 2,
    c: 3
  }

  const keys = []

  const nobj = await asyncFilterObject(obj, async (v, k, o) => {
    expect(o).toBe(obj)
    keys.push(k)
    return v % 2 === 1
  })

  expect(keys).toEqual(['a', 'b', 'c'])
  expect(nobj).toEqual({
    a: 1,
    c: 3
  })
})
