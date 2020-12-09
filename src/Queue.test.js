
import { expect, test } from '@jest/globals'
import Queue from './Queue'
import waitPrecise from './waitPrecise'
import _ from 'lodash'
import delay from './delay'
import CancelledError from './CancelledError'

test('Queue base 1', async () => {
  const unit = 30
  const start = new Date().getTime()
  const queue = new Queue(1)
  expect(queue.running).toBe(0)
  expect(queue.pending).toBe(0)
  const promises = []
  const callCount = {}
  for (const x of _.range(3)) {
    callCount[x] = 0
    const p = queue.exec(async () => {
      callCount[x] += 1
      await waitPrecise(unit)
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
  await promises[0]
  await delay()
  expect(queue.running).toBe(1)
  expect(queue.pending).toBe(1)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(0)
  let now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 1)
  expect(now - start).toBeLessThan(unit * 1 * 3)
  await promises[1]
  await delay()
  expect(queue.running).toBe(1)
  expect(queue.pending).toBe(0)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 2)
  expect(now - start).toBeLessThan(unit * 2 * 3)
  await promises[2]
  expect(queue.running).toBe(0)
  expect(queue.pending).toBe(0)
  now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 3)
  expect(now - start).toBeLessThan(unit * 3 * 3)
})

test('Queue base 2', async () => {
  const unit = 30
  const start = new Date().getTime()
  const queue = new Queue(2)
  expect(queue.running).toBe(0)
  expect(queue.pending).toBe(0)
  const promises = []
  const callCount = {}
  for (const x of _.range(6)) {
    callCount[x] = 0
    const p = queue.exec(async () => {
      callCount[x] += 1
      await waitPrecise(unit)
    })
    expect(p).toBeInstanceOf(Promise)
    promises.push(p)
  }
  expect(promises.length).toBe(6)
  expect(queue.running).toBe(2)
  expect(queue.pending).toBe(4)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(0)
  expect(callCount[3]).toBe(0)
  expect(callCount[4]).toBe(0)
  expect(callCount[5]).toBe(0)
  await promises[0]
  await promises[1]
  await delay()
  expect(queue.running).toBe(2)
  expect(queue.pending).toBe(2)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  expect(callCount[3]).toBe(1)
  expect(callCount[4]).toBe(0)
  expect(callCount[5]).toBe(0)
  let now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 1)
  expect(now - start).toBeLessThan(unit * 1 * 3)
  await promises[2]
  await promises[3]
  await delay()
  expect(queue.running).toBe(2)
  expect(queue.pending).toBe(0)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  expect(callCount[3]).toBe(1)
  expect(callCount[4]).toBe(1)
  expect(callCount[5]).toBe(1)
  now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 2)
  expect(now - start).toBeLessThan(unit * 2 * 3)
  await promises[4]
  await promises[5]
  expect(queue.running).toBe(0)
  expect(queue.pending).toBe(0)
  now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 3)
  expect(now - start).toBeLessThan(unit * 3 * 3)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  expect(callCount[3]).toBe(1)
  expect(callCount[4]).toBe(1)
  expect(callCount[5]).toBe(1)
})

test('Queue infinity', async () => {
  const unit = 30
  const start = new Date().getTime()
  const queue = new Queue(Number.POSITIVE_INFINITY)
  expect(queue.concurrency).toBe(Number.POSITIVE_INFINITY)
  expect(queue.running).toBe(0)
  expect(queue.pending).toBe(0)
  const promises = []
  const callCount = {}
  for (const x of _.range(6)) {
    callCount[x] = 0
    const p = queue.exec(async () => {
      callCount[x] += 1
      await waitPrecise(unit)
    })
    expect(p).toBeInstanceOf(Promise)
    promises.push(p)
  }
  expect(promises.length).toBe(6)
  expect(queue.running).toBe(6)
  expect(queue.pending).toBe(0)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  expect(callCount[3]).toBe(1)
  expect(callCount[4]).toBe(1)
  expect(callCount[5]).toBe(1)
  await Promise.all(promises)
  expect(queue.running).toBe(0)
  expect(queue.pending).toBe(0)
  const now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 1)
  expect(now - start).toBeLessThan(unit * 1 * 3)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  expect(callCount[3]).toBe(1)
  expect(callCount[4]).toBe(1)
  expect(callCount[5]).toBe(1)
})

test('Queue infinity race', async () => {
  const unit = 30
  const start = new Date().getTime()
  const queue = new Queue(Number.POSITIVE_INFINITY)
  expect(queue.concurrency).toBe(Number.POSITIVE_INFINITY)
  expect(queue.running).toBe(0)
  expect(queue.pending).toBe(0)
  const promises = []
  const callCount = {}
  const completeCount = {}
  for (const x of _.range(6)) {
    callCount[x] = 0
    completeCount[x] = 0
    const p = queue.exec(async () => {
      callCount[x] += 1
      await waitPrecise(unit)
      completeCount[x] += 1
    })
    expect(p).toBeInstanceOf(Promise)
    promises.push(p)
  }
  expect(promises.length).toBe(6)
  expect(queue.running).toBe(6)
  expect(queue.pending).toBe(0)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  expect(callCount[3]).toBe(1)
  expect(callCount[4]).toBe(1)
  expect(callCount[5]).toBe(1)
  await Promise.race(promises)
  expect(queue.running).toBe(6 - Object.values(completeCount).reduce((p, c) => p + c, 0))
  expect(queue.pending).toBe(0)
  await Promise.all(promises)
  expect(queue.running).toBe(0)
  expect(queue.pending).toBe(0)
  const now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 1)
  expect(now - start).toBeLessThan(unit * 1 * 3)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  expect(callCount[3]).toBe(1)
  expect(callCount[4]).toBe(1)
  expect(callCount[5]).toBe(1)
})

test('Queue throws', async () => {
  const unit = 30
  const start = new Date().getTime()
  const queue = new Queue(2)
  expect(queue.running).toBe(0)
  expect(queue.pending).toBe(0)
  const promises = []
  const callCount = {}
  for (const x of _.range(6)) {
    callCount[x] = 0
    const p = queue.exec(async () => {
      callCount[x] += 1
      await waitPrecise(unit)
      if (x % 2 === 1) {
        throw new Error()
      }
    })
    expect(p).toBeInstanceOf(Promise)
    promises.push(p.then(() => {
      return 'success'
    }, () => {
      return 'fail'
    }))
  }
  expect(promises.length).toBe(6)
  expect(queue.running).toBe(2)
  expect(queue.pending).toBe(4)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(0)
  expect(callCount[3]).toBe(0)
  expect(callCount[4]).toBe(0)
  expect(callCount[5]).toBe(0)
  const results = await Promise.all(promises)
  expect(queue.running).toBe(0)
  expect(queue.pending).toBe(0)
  const now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 3)
  expect(now - start).toBeLessThan(unit * 3 * 3)
  expect(results[0]).toBe('success')
  expect(results[1]).toBe('fail')
  expect(results[2]).toBe('success')
  expect(results[3]).toBe('fail')
  expect(results[4]).toBe('success')
  expect(results[5]).toBe('fail')
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  expect(callCount[3]).toBe(1)
  expect(callCount[4]).toBe(1)
  expect(callCount[5]).toBe(1)
})

test('Queue all cancels', async () => {
  const queue = new Queue(1)
  const [p, cancel] = queue.execCancellable(() => {
    return 'test'
  })
  cancel()
  queue.cancelAllPending()
  await p
})

test('Queue priority', async () => {
  const unit = 30
  const start = new Date().getTime()
  const queue = new Queue(1)
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
  await delay()
  let now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 1)
  expect(now - start).toBeLessThan(unit * 1 * 3)
  expect(queue.running).toBe(1)
  expect(queue.pending).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(1)

  await promises[2]
  await delay()
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

test('Queue cancel', async () => {
  const unit = 30
  const queue = new Queue(1)
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

test('Queue cancelAllPending', async () => {
  const unit = 30
  const queue = new Queue(1)
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

test('Queue infinity cancel', async () => {
  const queue = new Queue(Number.POSITIVE_INFINITY)
  const [p, cancel] = queue.execCancellable(() => 'test', 0)
  expect(cancel()).toBe(false)
  expect(queue.cancelAllPending()).toBe(false)
  await p
})

test('Queue concurrency 1', async () => {
  const unit = 30
  const start = new Date().getTime()
  const mutex = new Queue(1)
  expect(mutex.running).toBe(0)
  expect(mutex.pending).toBe(0)
  const promises = []
  const callCount = {}
  for (const x of _.range(3)) {
    callCount[x] = 0
    const p = mutex.exec(async () => {
      callCount[x] += 1
      await waitPrecise(unit)
    })
    expect(p).toBeInstanceOf(Promise)
    promises.push(p)
  }
  expect(promises.length).toBe(3)
  expect(mutex.running).toBe(1)
  expect(mutex.pending).toBe(2)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
  await promises[0]
  await delay()
  expect(mutex.running).toBe(1)
  expect(mutex.pending).toBe(1)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(0)
  let now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 1)
  expect(now - start).toBeLessThan(unit * 1 * 3)
  await promises[1]
  await delay()
  expect(mutex.running).toBe(1)
  expect(mutex.pending).toBe(0)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 2)
  expect(now - start).toBeLessThan(unit * 2 * 3)
  await promises[2]
  expect(mutex.running).toBe(0)
  expect(mutex.pending).toBe(0)
  now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 3)
  expect(now - start).toBeLessThan(unit * 3 * 3)
})

test('Queue concurrency 1 all cancels', async () => {
  const queue = new Queue(1)
  const [p, cancel] = queue.execCancellable(() => {
    return 'test'
  })
  cancel()
  queue.cancelAllPending()
  await p
})

test('Queue concurrency 1 priority', async () => {
  const unit = 30
  const start = new Date().getTime()
  const mutex = new Queue(1)
  expect(mutex.running).toBe(0)
  expect(mutex.pending).toBe(0)
  const promises = []
  const callCount = {}
  for (const x of _.range(3)) {
    callCount[x] = 0
    const p = mutex.exec(async () => {
      callCount[x] += 1
      await waitPrecise(unit)
    }, 10)
    expect(p).toBeInstanceOf(Promise)
    promises.push(p)
  }
  expect(promises.length).toBe(3)
  expect(mutex.running).toBe(1)
  expect(mutex.pending).toBe(2)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
  await promises[0]
  await delay()
  expect(mutex.running).toBe(1)
  expect(mutex.pending).toBe(1)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(0)
  let now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 1)
  expect(now - start).toBeLessThan(unit * 1 * 3)
  await promises[1]
  await delay()
  expect(mutex.running).toBe(1)
  expect(mutex.pending).toBe(0)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 2)
  expect(now - start).toBeLessThan(unit * 2 * 3)
  await promises[2]
  expect(mutex.running).toBe(0)
  expect(mutex.pending).toBe(0)
  now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 3)
  expect(now - start).toBeLessThan(unit * 3 * 3)
})

test('Queue concurrency 1 priority all cancels', async () => {
  const queue = new Queue(1)
  const [p, cancel] = queue.execCancellable(() => {
    return 'test'
  }, 0)
  cancel()
  queue.cancelAllPending()
  await p
})
