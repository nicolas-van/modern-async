
import { expect, test } from '@jest/globals'
import sleepPrecise from './sleepPrecise.mjs'
import Scheduler, { exceptionHandler } from './Scheduler.mjs'
import CancelledError from './CancelledError.mjs'
import Deferred from './Deferred.mjs'

test('Scheduler base', async () => {
  const unit = 30
  let callCount = 0
  const d = new Deferred()
  const scheduler = new Scheduler(async () => {
    callCount += 1
    await d.promise
  }, unit)
  expect(scheduler.delay).toBe(30)
  expect(scheduler.startImmediate).toBe(false)
  expect(scheduler.concurrency).toBe(1)
  expect(scheduler.maxPending).toBe(0)
  expect(scheduler.started).toBe(false)
  scheduler.start()
  expect(scheduler.started).toBe(true)
  d.resolve()
  await sleepPrecise(unit * 1.5 * 3)
  scheduler.stop()
  expect(scheduler.started).toBe(false)
  expect(callCount).toBeGreaterThanOrEqual(3)
})

test('Scheduler multi start stop', async () => {
  const unit = 30
  let callCount = 0
  const d = new Deferred()
  const scheduler = new Scheduler(async () => {
    callCount += 1
    await d.promise
  }, unit)
  expect(scheduler.delay).toBe(30)
  expect(scheduler.startImmediate).toBe(false)
  expect(scheduler.concurrency).toBe(1)
  expect(scheduler.maxPending).toBe(0)
  expect(scheduler.started).toBe(false)
  scheduler.start()
  expect(scheduler.started).toBe(true)
  scheduler.start()
  expect(scheduler.started).toBe(true)
  d.resolve()
  await sleepPrecise(unit * 1.5 * 3)
  scheduler.stop()
  expect(scheduler.started).toBe(false)
  scheduler.stop()
  expect(scheduler.started).toBe(false)
  expect(callCount).toBeGreaterThanOrEqual(3)
})

test('Scheduler startImmediate', async () => {
  const unit = 30
  let callCount = 0
  const d = new Deferred()
  const scheduler = new Scheduler(async () => {
    callCount += 1
    await d.promise
  }, unit, {
    startImmediate: true
  })
  expect(scheduler.delay).toBe(30)
  expect(scheduler.startImmediate).toBe(true)
  expect(scheduler.concurrency).toBe(1)
  expect(scheduler.maxPending).toBe(0)
  expect(scheduler.started).toBe(false)
  scheduler.start()
  expect(scheduler.started).toBe(true)
  d.resolve()
  await sleepPrecise(unit * 1.5 * 3)
  scheduler.stop()
  expect(scheduler.started).toBe(false)
  expect(callCount).toBeGreaterThanOrEqual(4)
})

test('Scheduler concurrency 1', async () => {
  let callCount = 0
  const d = new Deferred()
  const scheduler = new Scheduler(async () => {
    callCount += 1
    await d.promise
  }, 10)
  expect(scheduler.started).toBe(false)
  scheduler.start()
  expect(scheduler.started).toBe(true)
  await sleepPrecise(100)
  d.resolve()
  expect(scheduler._queue.pending).toBe(0)
  scheduler.stop()
  expect(scheduler.started).toBe(false)
  expect(callCount).toBe(1)
  await sleepPrecise(100)
  expect(callCount).toBe(1)
})

test('Scheduler pending', async () => {
  let callCount = 0
  const d = new Deferred()
  const scheduler = new Scheduler(async () => {
    callCount += 1
    await d.promise
  }, 10, {
    maxPending: Number.POSITIVE_INFINITY
  })
  expect(scheduler.started).toBe(false)
  scheduler.start()
  expect(scheduler.started).toBe(true)
  await sleepPrecise(150)
  expect(scheduler._queue.pending).toBeGreaterThan(3)
  scheduler.stop()
  expect(scheduler._queue.pending).toBe(0)
  expect(scheduler.started).toBe(false)
  expect(callCount).toBe(1)
  d.resolve()
  await sleepPrecise(150)
  expect(callCount).toBe(1)
})

test('Scheduler concurrency 2', async () => {
  let callCount = 0
  const d = new Deferred()
  const scheduler = new Scheduler(async () => {
    callCount += 1
    await d.promise
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
  expect(callCount).toBe(2)
  d.resolve()
  await sleepPrecise(150)
  expect(callCount).toBe(2)
})

test('Scheduler exceptionHandler', async () => {
  expect(() => {
    exceptionHandler(new Error())
  }).toThrow()
  exceptionHandler(new CancelledError())
})
