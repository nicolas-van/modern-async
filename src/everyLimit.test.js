
import { expect, test } from '@jest/globals'
import everyLimit from './everyLimit'
import _ from 'lodash'
import waitPrecise from './waitPrecise'

test('everyLimit compatibility', async () => {
  let res = await everyLimit(_.range(3), async (v) => {
    await waitPrecise(10)
    return true
  }, 1)
  expect(res).toBe(_.range(3).every((v) => true))

  res = await everyLimit(_.range(3), async (v) => {
    await waitPrecise(10)
    return v !== 2
  }, 1)
  expect(res).toBe(_.range(3).every((v) => v !== 2))

  res = await everyLimit(_.range(3), async (v) => {
    await waitPrecise(10)
    return false
  }, 1)
  expect(res).toBe(_.range(3).every((v) => false))

  res = await everyLimit([], async (v) => {
    await waitPrecise(10)
    return false
  }, 1)
  expect(res).toBe([].every((v) => false))

  res = await everyLimit([], async (v) => {
    await waitPrecise(10)
    return true
  }, 1)
  expect(res).toBe([].every((v) => true))
})

test('everyLimit parallel', async () => {
  let res = await everyLimit(_.range(3), async (v) => {
    await waitPrecise(10)
    return true
  }, 10)
  expect(res).toBe(_.range(3).every((v) => true))

  res = await everyLimit(_.range(3), async (v) => {
    await waitPrecise(10)
    return v !== 2
  }, 10)
  expect(res).toBe(_.range(3).every((v) => v !== 2))

  res = await everyLimit(_.range(3), async (v) => {
    await waitPrecise(10)
    return false
  }, 10)
  expect(res).toBe(_.range(3).every((v) => false))

  res = await everyLimit([], async (v) => {
    await waitPrecise(10)
    return false
  }, 10)
  expect(res).toBe([].every((v) => false))

  res = await everyLimit([], async (v) => {
    await waitPrecise(10)
    return true
  }, 10)
  expect(res).toBe([].every((v) => true))
})
