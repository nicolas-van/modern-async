
import { expect, test } from '@jest/globals'
import asyncEvery from './asyncEvery.mjs'
import Deferred from './Deferred.mjs'
import { range } from 'itertools'
import asyncDelay from './asyncDelay.mjs'

// eslint-disable-next-line require-jsdoc
class TestError extends Error {}

test('asyncEvery compatibility', async () => {
  let d = new Deferred()
  let p = asyncEvery([...range(3)], async (v) => {
    await d.promise
    return true
  }, 1)
  d.resolve()
  expect(await p).toBe([...range(3)].every((v) => true))

  d = new Deferred()
  p = asyncEvery([...range(3)], async (v) => {
    await d.promise
    return v !== 2
  }, 1)
  d.resolve()
  expect(await p).toBe([...range(3)].every((v) => v !== 2))

  d = new Deferred()
  p = asyncEvery([...range(3)], async (v) => {
    await d.promise
    return false
  }, 1)
  d.resolve()
  expect(await p).toBe([...range(3)].every((v) => false))

  d = new Deferred()
  p = asyncEvery([], async (v) => {
    await d.promise
    return false
  }, 1)
  d.resolve()
  expect(await p).toBe([].every((v) => false))

  d = new Deferred()
  p = asyncEvery([], async (v) => {
    await d.promise
    return true
  }, 1)
  d.resolve()
  expect(await p).toBe([].every((v) => true))
})

test('asyncEvery parallel', async () => {
  let d = new Deferred()
  let p = asyncEvery([...range(3)], async (v) => {
    await d.promise
    return true
  }, 10)
  d.resolve()
  expect(await p).toBe([...range(3)].every((v) => true))

  d = new Deferred()
  p = asyncEvery([...range(3)], async (v) => {
    await d.promise
    return v !== 2
  }, 10)
  d.resolve()
  expect(await p).toBe([...range(3)].every((v) => v !== 2))

  d = new Deferred()
  p = asyncEvery([...range(3)], async (v) => {
    await d.promise
    return false
  }, 10)
  d.resolve()
  expect(await p).toBe([...range(3)].every((v) => false))

  d = new Deferred()
  p = asyncEvery([], async (v) => {
    await d.promise
    return false
  }, 10)
  d.resolve()
  expect(await p).toBe([].every((v) => false))

  d = new Deferred()
  p = asyncEvery([], async (v) => {
    await d.promise
    return true
  }, 10)
  d.resolve()
  expect(await p).toBe([].every((v) => true))
})

test('asyncEvery first in time', async () => {
  const ds = [...range(3)].map(() => new Deferred())
  const p = asyncEvery(range(3), async (v, i) => {
    await ds[i]
    return false
  }, 3)
  ds[2].resolve()
  const res = await p
  expect(res).toBe(false)
})

test('asyncEvery error', async () => {
  const callList = [...range(3)].map(() => 0)
  const p = asyncEvery([...range(3)], async (v, i) => {
    callList[i] += 1
    if (i === 1) {
      throw new TestError()
    }
    return true
  }, 1)
  try {
    await p
    expect(true).toStrictEqual(false)
  } catch (e) {
    expect(e).toBeInstanceOf(TestError)
  }
  await asyncDelay()
  expect(callList[0]).toStrictEqual(1)
  expect(callList[1]).toStrictEqual(1)
  expect(callList[2]).toStrictEqual(0)
})

test('asyncEvery infinite concurrency all pass', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = asyncEvery([...range(3)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    return true
  }, Number.POSITIVE_INFINITY)
  await ds[2].promise
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  d.resolve()
  const res = await p
  expect(res).toBe(true)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
})

test('asyncEvery infinite concurrency no all pass', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = asyncEvery([...range(3)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    if (i === 1) {
      return false
    } else {
      return true
    }
  }, Number.POSITIVE_INFINITY)
  await ds[2].promise
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
  d.resolve()
  const res = await p
  expect(res).toBe(false)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
})

test('asyncEvery infinite concurrency error', async () => {
  const p = asyncEvery([...range(3)], async (v, i) => {
    if (i === 1) {
      throw new TestError()
    }
    return true
  }, Number.POSITIVE_INFINITY)

  try {
    await p
    expect(true).toStrictEqual(false)
  } catch (e) {
    expect(e).toBeInstanceOf(TestError)
  }
  await asyncDelay()
})

test('asyncEvery concurrency 1 all pass', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = asyncEvery([...range(3)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    return true
  })
  await ds[0].promise
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
  d.resolve()
  const res = await p
  expect(res).toBe(true)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(1)
})

test('asyncEvery concurrency 1 no all pass', async () => {
  const callCount = {}
  ;[...range(3)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(3)].map(() => new Deferred())
  const p = asyncEvery([...range(3)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    if (i === 1) {
      return false
    } else {
      return true
    }
  })
  await ds[0].promise
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
  d.resolve()
  const res = await p
  expect(res).toBe(false)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(0)
})

test('asyncEvery concurrency 1 error', async () => {
  const callList = [...range(3)].map(() => 0)
  const p = asyncEvery([...range(3)], async (v, i) => {
    callList[i] += 1
    if (i === 1) {
      throw new TestError()
    }
    return true
  })
  try {
    await p
    expect(true).toStrictEqual(false)
  } catch (e) {
    expect(e).toBeInstanceOf(TestError)
  }
  await asyncDelay()
  expect(callList[0]).toStrictEqual(1)
  expect(callList[1]).toStrictEqual(1)
  expect(callList[2]).toStrictEqual(0)
})
