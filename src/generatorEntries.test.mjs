
import { expect, test } from '@jest/globals'
import generatorEntries from './generatorEntries.mjs'

test('generatorEntries base', async () => {
  const obj = {
    a: 1,
    b: 2,
    c: 3
  }

  expect(Object.entries(obj)).toStrictEqual([['a', 1], ['b', 2], ['c', 3]])

  const arr = Array.from(generatorEntries(obj))

  expect(arr).toEqual([['a', 1], ['b', 2], ['c', 3]])
})

test('generatorEntries do not iterate over non owned values', async () => {
  const proto = {
    a: 1
  }

  const obj = {
    b: 2,
    c: 3
  }

  Object.setPrototypeOf(obj, proto)

  expect(obj.a).toStrictEqual(1)
  expect(Object.entries(obj)).toStrictEqual([['b', 2], ['c', 3]])

  const arr = Array.from(generatorEntries(obj))

  expect(arr).toEqual([['b', 2], ['c', 3]])
})
