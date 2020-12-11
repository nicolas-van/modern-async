
import { expect, test } from '@jest/globals'
import sleep from './sleep'
import sleepPrecise from './sleepPrecise'
import Scheduler from './Scheduler'

test('Scheduler base', async () => {
  let callCount = 0
  const scheduler = new Scheduler(async () => {
    callCount += 1
    await sleep(10)
  }, 30)
  expect(scheduler.delay).toBe(30)
  expect(scheduler.startImmediate).toBe(false)
  expect(scheduler.concurrency).toBe(1)
  expect(scheduler.maxPending).toBe(0)
  expect(scheduler.started).toBe(false)
  scheduler.start()
  expect(scheduler.started).toBe(true)
  await sleepPrecise(105)
  scheduler.stop()
  expect(scheduler.started).toBe(false)
  expect(callCount).toBe(3)
})

test('Scheduler multi start stop', async () => {
  let callCount = 0
  const scheduler = new Scheduler(async () => {
    callCount += 1
    await sleep(10)
  }, 30)
  expect(scheduler.delay).toBe(30)
  expect(scheduler.startImmediate).toBe(false)
  expect(scheduler.concurrency).toBe(1)
  expect(scheduler.maxPending).toBe(0)
  expect(scheduler.started).toBe(false)
  scheduler.start()
  expect(scheduler.started).toBe(true)
  scheduler.start()
  expect(scheduler.started).toBe(true)
  await sleepPrecise(105)
  scheduler.stop()
  expect(scheduler.started).toBe(false)
  scheduler.stop()
  expect(scheduler.started).toBe(false)
  expect(callCount).toBe(3)
})

test('Scheduler startImmediate', async () => {
  let callCount = 0
  const scheduler = new Scheduler(async () => {
    callCount += 1
    await sleep(10)
  }, 30, {
    startImmediate: true
  })
  expect(scheduler.delay).toBe(30)
  expect(scheduler.startImmediate).toBe(true)
  expect(scheduler.concurrency).toBe(1)
  expect(scheduler.maxPending).toBe(0)
  expect(scheduler.started).toBe(false)
  scheduler.start()
  expect(scheduler.started).toBe(true)
  await sleepPrecise(105)
  scheduler.stop()
  expect(scheduler.started).toBe(false)
  expect(callCount).toBe(4)
})

test('Scheduler concurrency 1', async () => {
  let callCount = 0
  const scheduler = new Scheduler(async () => {
    callCount += 1
    await sleep(100)
  }, 10)
  expect(scheduler.started).toBe(false)
  scheduler.start()
  expect(scheduler.started).toBe(true)
  await sleepPrecise(150)
  expect(scheduler._queue.pending).toBe(0)
  scheduler.stop()
  expect(scheduler.started).toBe(false)
  expect(callCount).toBe(2)
  await sleepPrecise(150)
  expect(callCount).toBe(2)
})

test('Scheduler pending', async () => {
  let callCount = 0
  const scheduler = new Scheduler(async () => {
    callCount += 1
    await sleep(100)
  }, 10, {
    maxPending: Number.POSITIVE_INFINITY
  })
  expect(scheduler.started).toBe(false)
  scheduler.start()
  expect(scheduler.started).toBe(true)
  await sleepPrecise(150)
  expect(scheduler._queue.pending).toBeGreaterThan(0)
  scheduler.stop()
  expect(scheduler._queue.pending).toBe(0)
  expect(scheduler.started).toBe(false)
  expect(callCount).toBe(2)
  await sleepPrecise(150)
  expect(callCount).toBe(2)
})

test('Scheduler concurrency 2', async () => {
  let callCount = 0
  const scheduler = new Scheduler(async () => {
    callCount += 1
    await sleep(100)
  }, 10, {
    concurrency: 2
  })
  expect(scheduler.started).toBe(false)
  scheduler.start()
  expect(scheduler.started).toBe(true)
  await sleepPrecise(150)
  expect(scheduler._queue.pending).toBe(0)
  scheduler.stop()
  expect(scheduler.started).toBe(false)
  expect(callCount).toBe(4)
  await sleepPrecise(150)
  expect(callCount).toBe(4)
})
