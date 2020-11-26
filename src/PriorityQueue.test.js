
import { expect, test } from '@jest/globals'
import PriorityQueue from './PriorityQueue'
import preciseWait from './preciseWait'

test('PriorityQueue', async () => {
  const unit = 30
  const start = new Date().getTime()
  const queue = new PriorityQueue(1)
  expect(queue.concurrency).toBe(1)
  expect(queue.running).toBe(0)
  expect(queue.pending).toBe(0)
  const promises = []
  const callCount = {}

  callCount[0] = 0
  promises.push(queue.exec(async () => {
    callCount[0] += 1
    await preciseWait(unit)
  }, 0))
  expect(queue.running).toBe(1)
  expect(queue.pending).toBe(0)
  expect(callCount[0]).toBe(1)

  callCount[1] = 0
  promises.push(queue.exec(async () => {
    callCount[1] += 1
    await preciseWait(unit)
  }, 1))
  expect(queue.running).toBe(1)
  expect(queue.pending).toBe(1)
  expect(callCount[1]).toBe(0)

  callCount[2] = 0
  promises.push(queue.exec(async () => {
    callCount[2] += 1
    await preciseWait(unit)
  }, 2))
  expect(queue.running).toBe(1)
  expect(queue.pending).toBe(2)
  expect(callCount[2]).toBe(0)

  await promises[0]
  let now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 1)
  expect(now - start).toBeLessThan(unit * 1 * 3)
  expect(queue.running).toBe(1)
  expect(queue.pending).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(1)

  await promises[2]
  now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 2)
  expect(now - start).toBeLessThan(unit * 2 * 3)
  expect(queue.running).toBe(1)
  expect(queue.pending).toBe(0)
  expect(callCount[1]).toBe(1)

  await promises[1]
  now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 3)
  expect(now - start).toBeLessThan(unit * 3 * 3)
  expect(queue.running).toBe(0)
  expect(queue.pending).toBe(0)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
})
