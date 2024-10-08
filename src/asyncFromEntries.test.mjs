
import { expect, test } from '@jest/globals'
import asyncFromEntries from './asyncFromEntries.mjs'

test('asyncFromEntries base sync', async () => {
  const entries = [['a', 1], ['b', 2], ['c', 3]]

  const obj = await asyncFromEntries(entries)

  expect(obj).toEqual({
    a: 1,
    b: 2,
    c: 3
  })
})

test('asyncFromEntries base async', async () => {
  const asyncEntryGenerator = async function * () {
    yield ['a', 1]
    yield ['b', 2]
    yield ['c', 3]
  }

  const obj = await asyncFromEntries(asyncEntryGenerator())

  expect(obj).toEqual({
    a: 1,
    b: 2,
    c: 3
  })
})
