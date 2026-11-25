import { expect, test } from '@jest/globals'
import asyncForEachObject from './asyncForEachObject.mjs'

test('asyncForEachObject base', async () => {
  const obj = {
    a: 1,
    b: 2,
    c: 3
  }

  const called = {}

  await asyncForEachObject(obj, async (v, k, o) => {
    expect(o).toBe(obj)
    called[k] = v
  })

  expect(called).toEqual({
    a: 1,
    b: 2,
    c: 3
  })
})
