
import { expect, test } from '@jest/globals'
import xrange from './xrange.mjs'

test('xrange(4)', async () => {
  const res = [...xrange(4)]
  expect(res).toStrictEqual([0, 1, 2, 3])
})

test('xrange(-4)', async () => {
  const res = [...xrange(-4)]
  expect(res).toStrictEqual([0, -1, -2, -3])
})

test('xrange(1, 5)', async () => {
  const res = [...xrange(1, 5)]
  expect(res).toStrictEqual([1, 2, 3, 4])
})

test('xrange(0, 20, 5)', async () => {
  const res = [...xrange(0, 20, 5)]
  expect(res).toStrictEqual([0, 5, 10, 15])
})

test('xrange(0, -4, -1)', async () => {
  const res = [...xrange(0, -4, -1)]
  expect(res).toStrictEqual([0, -1, -2, -3])
})

test('xrange(0, -4)', async () => {
  const res = [...xrange(0, -4)]
  expect(res).toStrictEqual([0, -1, -2, -3])
})

test('xrange(0)', async () => {
  const res = [...xrange(0)]
  expect(res).toStrictEqual([])
})

test('xrange step 0', async () => {
  expect(() => [...xrange(1, 4, 0)]).toThrow()
})

test('xrange step wrong direction', async () => {
  expect(() => [...xrange(1, 4, -1)]).toThrow()
  expect(() => [...xrange(10, -4, 1)]).toThrow()
})

test('xrange go beyond end', async () => {
  const res = [...xrange(0, 5, 2)]
  expect(res).toStrictEqual([0, 2, 4])
})

test('xrange go below end', async () => {
  const res = [...xrange(2, -5, -2)]
  expect(res).toStrictEqual([2, 0, -2, -4])
})
