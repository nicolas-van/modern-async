
import { expect, test } from '@jest/globals'
import findIndex from './findIndex.mjs'
import Deferred from './Deferred.mjs'
import { range } from 'itertools'
import delay from './delay.mjs'

test('findIndex compatibility', async () => {
  let d = new Deferred()
  let p = findIndex([...range(3)], async (v) => {
    await d.promise
    return v === 2
  }, 1)
  d.resolve()
  expect(await p).toBe([...range(3)].findIndex((v) => v === 2))

  d = new Deferred()
  p = findIndex([...range(3)], async (v) => {
    await d.promise
    return v === 5
  }, 1)
  d.resolve()
  expect(await p).toBe([...range(3)].findIndex((v) => v === 5))

  d = new Deferred()
  p = findIndex([], async (v) => {
    await d.promise
    return v === 5
  }, 1)
  d.resolve()
  expect(await p).toBe([].findIndex((v) => v === 5))
})

test('findIndex cancel subsequent', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = findIndex([...range(3)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    return v === 0
  }, 1)
  await ds[0].promise
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
  d.resolve()
  await delay()
  const res = await p
  expect(res).toBe(0)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
})

test('findIndex cancel subsequent 2', async () => {
  const callCount = {}
  ;[...range(6)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = findIndex([...range(6)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    return v === 0
  }, 2)
  await ds[1].promise
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(0)
  expect(callCount[3]).toBe(0)
  expect(callCount[4]).toBe(0)
  expect(callCount[5]).toBe(0)
  d.resolve()
  await delay()
  const res = await p
  expect(res === 0 || res === 1).toBe(true)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(0)
  expect(callCount[3]).toBe(0)
  expect(callCount[4]).toBe(0)
  expect(callCount[5]).toBe(0)
})

test('findIndex find first in order', async () => {
  const arr = [0, 1, 0]
  let d1 = new Deferred()
  let d2 = new Deferred()
  let p = findIndex(arr, async (v, index) => {
    if (index === 0) {
      await d1.promise
    } else {
      await d2.promise
    }
    return v === 0
  }, 3, true)
  d1.resolve()
  await delay()
  d2.resolve()
  let res = await p
  expect(res).toBe(0)
  d2.resolve()

  d1 = new Deferred()
  d2 = new Deferred()
  p = findIndex(arr, async (v, index) => {
    if (index === 0) {
      await d1.promise
    } else {
      await d2.promise
    }
    return v === 0
  }, 3, true)
  d2.resolve()
  await delay()
  d1.resolve()
  res = await p
  expect(res).toBe(0)
  d1.resolve()
})

test('findIndex error', async () => {
  const arr = [0, 1, 2]
  try {
    const d = new Deferred()
    const p = findIndex(arr, async (v, index) => {
      if (index === 1) {
        throw new Error('test')
      } else {
        await d.promise
      }
      return v === 2
    }, 3)
    d.resolve()
    await p
    expect(false).toBe(true)
  } catch (e) {
    expect(e.message).toBe('test')
  }
})

test('findIndex error after completion', async () => {
  const arr = [0, 1]
  const d1 = new Deferred()
  const d2 = new Deferred()
  const p = findIndex(arr, async (v, index) => {
    if (index === 0) {
      await d1.promise
      return true
    } else {
      await d2.promise
      throw new Error('should be ignored')
    }
  }, 2)
  d1.resolve()
  d2.resolve()
  const res = await p
  expect(res).toBe(0)
})

test('findIndex concurrency', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = findIndex([...range(10)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    return v === 1
  }, 3)
  await delay()
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  d.resolve()
  const res = await p
  expect(res).toBe(1)
})

test('findIndex infinite concurrency', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = findIndex([...range(3)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    return v === 0
  }, Number.POSITIVE_INFINITY)
  await ds[2].promise
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  d.resolve()
  const res = await p
  expect(res).toBe(0)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
})

test('findIndex concurrency 1', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = findIndex([...range(3)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    return v === 0
  })
  await ds[0].promise
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
  d.resolve()
  const res = await p
  expect(res).toBe(0)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
})

test('findIndex concurrency 1 ordered', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = findIndex([...range(3)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    if (i === 0) {
      await d.promise
    }
    return true
  })
  await ds[0].promise
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
  d.resolve()
  const res = await p
  expect(res).toBe(0)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
})

test('findIndex concurrency 1 error', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  try {
    await findIndex([...range(3)], async (v, i) => {
      callCount[i] += 1
      if (i === 0) {
        throw new Error('test')
      }
      return true
    })
    expect(true).toBe(false)
  } catch (e) {
    expect(e.message).toBe('test')
  }
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
})
