
import { expect, test } from '@jest/globals'
import QueuePriority from './QueuePriority'
import waitPrecise from './waitPrecise'
import CancelledError from './CancelledError'
import _ from 'lodash'

test('QueuePriority', async () => {
  const unit = 30
  const start = new Date().getTime()
  const queue = new QueuePriority(1)
  expect(queue.concurrency).toBe(1)
  expect(queue.running).toBe(0)
  expect(queue.pending).toBe(0)
  const promises = []
  const callCount = {}

  callCount[0] = 0
  promises.push(queue.exec(async () => {
    callCount[0] += 1
    await waitPrecise(unit)
  }, 0))
  expect(queue.running).toBe(1)
  expect(queue.pending).toBe(0)
  expect(callCount[0]).toBe(1)

  callCount[1] = 0
  promises.push(queue.exec(async () => {
    callCount[1] += 1
    await waitPrecise(unit)
  }, 1))
  expect(queue.running).toBe(1)
  expect(queue.pending).toBe(1)
  expect(callCount[1]).toBe(0)

  callCount[2] = 0
  promises.push(queue.exec(async () => {
    callCount[2] += 1
    await waitPrecise(unit)
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

test('QueuePriority cancel', async () => {
  const unit = 30
  const queue = new QueuePriority(1)
  const promises = []
  const cancels = []
  const callCount = {}
  for (const x in _.range(3)) {
    callCount[x] = 0
    const [p, cancel] = queue.execCancellable(async () => {
      callCount[x] += 1
      await waitPrecise(unit)
      return 'test'
    }, 0)
    const p2 = p.catch((e) => {
      expect(e).toBeInstanceOf(CancelledError)
      return e
    })
    promises.push(p2)
    cancels.push(cancel)
  }
  expect(promises.length).toBe(3)
  expect(cancels.length).toBe(3)
  expect(queue.running).toBe(1)
  expect(queue.pending).toBe(2)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)

  expect(cancels[0]()).toBe(false)

  expect(queue.running).toBe(1)
  expect(queue.pending).toBe(2)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)

  expect(cancels[1]()).toBe(true)

  expect(queue.running).toBe(1)
  expect(queue.pending).toBe(1)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)

  expect(cancels[1]()).toBe(false)

  expect(queue.running).toBe(1)
  expect(queue.pending).toBe(1)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)

  const results = await Promise.all(promises)

  expect(queue.running).toBe(0)
  expect(queue.pending).toBe(0)

  expect(results[0]).toBe('test')
  expect(results[1]).toBeInstanceOf(CancelledError)
  expect(results[2]).toBe('test')

  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(1)

  expect(cancels[0]()).toBe(false)
  expect(cancels[1]()).toBe(false)
  expect(cancels[2]()).toBe(false)
})

test('QueuePriority cancelAllPending', async () => {
  const unit = 30
  const queue = new QueuePriority(1)
  const promises = []
  const callCount = {}
  for (const x in _.range(3)) {
    callCount[x] = 0
    const p = queue.exec(async () => {
      callCount[x] += 1
      await waitPrecise(unit)
      return 'test'
    }, 0).catch((e) => {
      expect(e).toBeInstanceOf(CancelledError)
      return e
    })
    expect(p).toBeInstanceOf(Promise)
    promises.push(p)
  }
  expect(promises.length).toBe(3)
  expect(queue.running).toBe(1)
  expect(queue.pending).toBe(2)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)

  queue.cancelAllPending()

  expect(queue.running).toBe(1)
  expect(queue.pending).toBe(0)

  expect(await promises[0]).toBe('test')
  expect(await promises[1]).toBeInstanceOf(CancelledError)
  expect(await promises[2]).toBeInstanceOf(CancelledError)

  expect(queue.running).toBe(0)
  expect(queue.pending).toBe(0)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
})

test('QueuePriority infinity cancel', async () => {
  const queue = new QueuePriority(Number.POSITIVE_INFINITY)
  const [p, cancel] = queue.execCancellable(() => 'test', 0)
  expect(cancel()).toBe(false)
  expect(queue.cancelAllPending()).toBe(false)
  await p
})
