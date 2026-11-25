import { expect, test } from '@jest/globals'
import asyncFindKey from './asyncFindKey.mjs'

test('asyncFindKey base', async () => {
  const obj = {
    a: 1,
    b: 2,
    c: 3
  }

  const keys = []

  const key = await asyncFindKey(obj, async (v, k, o) => {
    expect(o).toBe(obj)
    keys.push(k)
    return v === 2
  })

  expect(keys).toEqual(['a', 'b'])
  expect(key).toBe('b')
})
