
import { expect, test } from '@jest/globals'
import asyncFindIndex from './asyncFindIndex.mjs'
import Deferred from './Deferred.mjs'
import { range } from 'itertools'
import asyncDelay from './asyncDelay.mjs'

test('asyncFindIndex compatibility', async () => {
  let d = new Deferred()
  let p = asyncFindIndex([...range(3)], async (v) => {
    await d.promise
    return v === 2
  }, 1)
  d.resolve()
  expect(await p).toBe([...range(3)].findIndex((v) => v === 2))

  d = new Deferred()
  p = asyncFindIndex([...range(3)], async (v) => {
    await d.promise
    return v === 5
  }, 1)
  d.resolve()
  expect(await p).toBe([...range(3)].findIndex((v) => v === 5))

  d = new Deferred()
  p = asyncFindIndex([], async (v) => {
    await d.promise
    return v === 5
  }, 1)
  d.resolve()
  expect(await p).toBe([].findIndex((v) => v === 5))
})

test('asyncFindIndex cancel subsequent', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = asyncFindIndex([...range(3)], async (v, i) => {
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
  await asyncDelay()
  const res = await p
  expect(res).toBe(0)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
})

test('asyncFindIndex cancel subsequent 2', async () => {
  const callCount = {}
  ;[...range(6)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = asyncFindIndex([...range(6)], async (v, i) => {
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
  await asyncDelay()
  const res = await p
  expect(res === 0 || res === 1).toBe(true)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(0)
  expect(callCount[3]).toBe(0)
  expect(callCount[4]).toBe(0)
  expect(callCount[5]).toBe(0)
})

test('asyncFindIndex find first in order', async () => {
  const arr = [0, 1, 0]
  let d1 = new Deferred()
  let d2 = new Deferred()
  let p = asyncFindIndex(arr, async (v, index) => {
    if (index === 0) {
      await d1.promise
    } else {
      await d2.promise
    }
    return v === 0
  }, 3, true)
  d1.resolve()
  await asyncDelay()
  d2.resolve()
  let res = await p
  expect(res).toBe(0)
  d2.resolve()

  d1 = new Deferred()
  d2 = new Deferred()
  p = asyncFindIndex(arr, async (v, index) => {
    if (index === 0) {
      await d1.promise
    } else {
      await d2.promise
    }
    return v === 0
  }, 3, true)
  d2.resolve()
  await asyncDelay()
  d1.resolve()
  res = await p
  expect(res).toBe(0)
  d1.resolve()
})

test('asyncFindIndex error', async () => {
  const arr = [0, 1, 2]
  try {
    const d = new Deferred()
    const p = asyncFindIndex(arr, async (v, index) => {
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

test('asyncFindIndex error after completion', async () => {
  const arr = [0, 1]
  const d1 = new Deferred()
  const d2 = new Deferred()
  const p = asyncFindIndex(arr, async (v, index) => {
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

test('asyncFindIndex concurrency', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = asyncFindIndex([...range(10)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    return v === 1
  }, 3)
  await asyncDelay()
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  d.resolve()
  const res = await p
  expect(res).toBe(1)
})

test('asyncFindIndex infinite concurrency', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = asyncFindIndex([...range(3)], async (v, i) => {
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

test('asyncFindIndex concurrency 1', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = asyncFindIndex([...range(3)], async (v, i) => {
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

test('asyncFindIndex concurrency 1 ordered', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = asyncFindIndex([...range(3)], async (v, i) => {
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

test('asyncFindIndex concurrency 1 error', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  try {
    await asyncFindIndex([...range(3)], async (v, i) => {
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
