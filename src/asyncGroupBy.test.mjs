import { expect, test } from '@jest/globals'
import asyncGroupBy from './asyncGroupBy.mjs'

test('asyncGroupBy base', async () => {
  const arr = [1, 2, 3, 4, 5]

  const result = await asyncGroupBy(arr, async (v, i, it) => {
    expect(it).toBe(arr)
    expect(i).toBe(v - 1)
    return v % 2 === 1 ? 'odd' : 'even'
  })

  expect(result).toEqual({
    odd: [1, 3, 5],
    even: [2, 4]
  })
})
