
/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */

import { expect, test } from '@jest/globals'
import asyncGeneratorMap from './asyncGeneratorMap.mjs'
import { range } from 'itertools'
import asyncDelay from './asyncDelay.mjs'
import Queue from './Queue.mjs'
import Deferred from './Deferred.mjs'
import asyncSleep from './asyncSleep'
import asyncIterableToArray from './asyncIterableToArray.mjs'

class TestError extends Error {}

test('asyncGeneratorMap base', async () => {
  const res = []
  for await (const el of asyncGeneratorMap(range(6), async (x) => x * 2, new Queue(1))) {
    res.push(el)
  }
  expect(res).toEqual([0, 2, 4, 6, 8, 10])
})

test('asyncGeneratorMap all resolve in micro tasks', async () => {
  const del = asyncDelay()
  const gen = asyncGeneratorMap(range(6), async (x) => x, new Queue(1))
  let finished = false
  ;(async () => {
    const res = []
    for await (const el of gen) {
      res.push(el)
    }
    return res
  })().then(async (res) => {
    expect(res).toStrictEqual([...range(6)])
    finished = true
  })
  await del
  expect(finished).toBe(true)
})

test('asyncGeneratorMap infinity all resolve in micro tasks', async () => {
  const del = asyncDelay()
  const gen = asyncGeneratorMap(range(6), async (x) => x, new Queue(Number.POSITIVE_INFINITY))
  let finished = false
  ;(async () => {
    const res = []
    for await (const el of gen) {
      res.push(el)
    }
    return res
  })().then(async (res) => {
    expect(res).toStrictEqual([...range(6)])
    finished = true
  })
  await del
  expect(finished).toBe(true)
})

test('asyncGeneratorMap same queue one level concurrency 1 random delays', async () => {
  const queue = new Queue(10)
  const gen1 = asyncGeneratorMap(range(1000), async (x, i) => {
    await asyncSleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const p = (async () => {
    const res = []
    for await (const el of gen1) {
      res.push(el)
    }
    return res
  })()
  const res = await p
  expect(res).toStrictEqual([...range(1000)].map((x) => x * 2))
})

test('asyncGeneratorMap same queue one level concurrency 10 random delays', async () => {
  const queue = new Queue(10)
  const gen1 = asyncGeneratorMap(range(1000), async (x, i) => {
    await asyncSleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const p = (async () => {
    const res = []
    for await (const el of gen1) {
      res.push(el)
    }
    return res
  })()
  const res = await p
  expect(res).toStrictEqual([...range(1000)].map((x) => x * 2))
})

test('asyncGeneratorMap same queue one level concurrency 3 busy queue random delays', async () => {
  const queue = new Queue(10)
  ;[...range(7)].forEach(element => {
    queue.exec(async () => new Promise(() => {}))
  })
  const gen1 = asyncGeneratorMap(range(1000), async (x, i) => {
    await asyncSleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const p = (async () => {
    const res = []
    for await (const el of gen1) {
      res.push(el)
    }
    return res
  })()
  const res = await p
  expect(res).toStrictEqual([...range(1000)].map((x) => x * 2))
}, 10000)

test('asyncGeneratorMap same queue three levels concurrency 1', async () => {
  const callList = []
  const queue = new Queue(1)
  const gen1 = asyncGeneratorMap(range(3), async (x, i) => {
    callList.push([0, i])
    return x * 2
  }, queue)
  const gen2 = asyncGeneratorMap(gen1, async (x, i) => {
    callList.push([1, i])
    return x * 2
  }, queue)
  const gen3 = asyncGeneratorMap(gen2, async (x, i) => {
    callList.push([2, i])
    return x * 2
  }, queue)
  const p = (async () => {
    const res = []
    for await (const el of gen3) {
      res.push(el)
    }
    return res
  })()
  const res = await p
  expect(res).toStrictEqual([0, 8, 16])
})

test('asyncGeneratorMap same queue three levels concurrency 2', async () => {
  const callList = []
  const queue = new Queue(2)
  const gen1 = asyncGeneratorMap(range(3), async (x, i) => {
    callList.push([0, i])
    return x * 2
  }, queue)
  const gen2 = asyncGeneratorMap(gen1, async (x, i) => {
    callList.push([1, i])
    return x * 2
  }, queue)
  const gen3 = asyncGeneratorMap(gen2, async (x, i) => {
    callList.push([2, i])
    return x * 2
  }, queue)
  const p = (async () => {
    const res = []
    for await (const el of gen3) {
      res.push(el)
    }
    return res
  })()
  const res = await p
  expect(res).toStrictEqual([0, 8, 16])
})

test('asyncGeneratorMap same queue three levels concurrency infinity', async () => {
  const callList = []
  const queue = new Queue(Number.POSITIVE_INFINITY)
  const gen1 = asyncGeneratorMap(range(3), async (x, i) => {
    callList.push([0, i])
    return x * 2
  }, queue)
  const gen2 = asyncGeneratorMap(gen1, async (x, i) => {
    callList.push([1, i])
    return x * 2
  }, queue)
  const gen3 = asyncGeneratorMap(gen2, async (x, i) => {
    callList.push([2, i])
    return x * 2
  }, queue)
  const p = (async () => {
    const res = []
    for await (const el of gen3) {
      res.push(el)
    }
    return res
  })()
  const res = await p
  expect(res).toStrictEqual([0, 8, 16])
})

test('asyncGeneratorMap same queue three levels concurrency 1 random delays', async () => {
  const queue = new Queue(1)
  const gen1 = asyncGeneratorMap(range(100), async (x, i) => {
    await asyncSleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const gen2 = asyncGeneratorMap(gen1, async (x, i) => {
    await asyncSleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const gen3 = asyncGeneratorMap(gen2, async (x, i) => {
    await asyncSleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const p = (async () => {
    const res = []
    for await (const el of gen3) {
      res.push(el)
    }
    return res
  })()
  const res = await p
  expect(res).toStrictEqual([...range(100)].map((x) => x * 8))
})

test('asyncGeneratorMap same queue three levels concurrency 5 random delays', async () => {
  const queue = new Queue(5)
  const gen1 = asyncGeneratorMap(range(100), async (x, i) => {
    await asyncSleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue, true)
  const gen2 = asyncGeneratorMap(gen1, async (x, i) => {
    await asyncSleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue, true)
  const gen3 = asyncGeneratorMap(gen2, async (x, i) => {
    await asyncSleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue, true)
  const p = (async () => {
    const res = []
    for await (const el of gen3) {
      res.push(el)
    }
    return res
  })()
  const res = await p
  expect(res).toStrictEqual([...range(100)].map((x) => x * 8))
})

test('asyncGeneratorMap same queue three levels infinity random delays', async () => {
  const queue = new Queue(Number.POSITIVE_INFINITY)
  const gen1 = asyncGeneratorMap(range(100), async (x, i) => {
    await asyncSleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const gen2 = asyncGeneratorMap(gen1, async (x, i) => {
    await asyncSleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const gen3 = asyncGeneratorMap(gen2, async (x, i) => {
    await asyncSleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const p = (async () => {
    const res = []
    for await (const el of gen3) {
      res.push(el)
    }
    return res
  })()
  const res = await p
  expect(res).toStrictEqual([...range(100)].map((x) => x * 8))
})

test('asyncGeneratorMap same queue three levels busy queue random delays ', async () => {
  const queue = new Queue(10)
  ;[...range(7)].forEach(element => {
    queue.exec(async () => new Promise(() => {}))
  })
  const gen1 = asyncGeneratorMap(range(100), async (x, i) => {
    await asyncSleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const gen2 = asyncGeneratorMap(gen1, async (x, i) => {
    await asyncSleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const gen3 = asyncGeneratorMap(gen2, async (x, i) => {
    await asyncSleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const p = (async () => {
    const res = []
    for await (const el of gen3) {
      res.push(el)
    }
    return res
  })()
  const res = await p
  expect(res).toStrictEqual([...range(100)].map((x) => x * 8))
})

test('asyncGeneratorMap fail fetch first', async () => {
  const bd = [...range(2)].map(() => new Deferred())
  const originGen = asyncGeneratorMap(range(2), async (x, i) => {
    await bd[i].promise
    if (i === 0) {
      throw new TestError()
    } else {
      return x
    }
  }, new Queue(2))

  const gen = asyncGeneratorMap(originGen, async (x) => {
    return (x + 1) * 2
  }, new Queue(2))

  const p1 = gen.next()

  bd[1].resolve()
  await asyncDelay()
  bd[0].resolve()

  try {
    await p1
    expect(false).toBe(true)
  } catch (e) {
    expect(e instanceof TestError).toBe(true)
  }
})

test('asyncGeneratorMap fail fetch second', async () => {
  const bd = [...range(2)].map(() => new Deferred())
  const originGen = asyncGeneratorMap(range(2), async (x, i) => {
    await bd[i].promise
    if (i === 1) {
      throw new TestError()
    } else {
      return x
    }
  }, new Queue(2))

  const gen = asyncGeneratorMap(originGen, async (x) => {
    return (x + 1) * 2
  }, new Queue(2))

  const p1 = gen.next()

  bd[1].resolve()
  await asyncDelay()
  bd[0].resolve()

  const res = await p1

  expect(res.done).toStrictEqual(false)
  expect(res.value).toStrictEqual(2)

  const p2 = gen.next()

  try {
    await p2
    expect(false).toBe(true)
  } catch (e) {
    expect(e instanceof TestError).toBe(true)
  }
})

test('asyncGeneratorMap fail process first', async () => {
  const bd = [...range(2)].map(() => new Deferred())
  const gen = asyncGeneratorMap(range(2), async (x, i) => {
    await bd[i].promise
    if (i === 0) {
      throw new TestError()
    } else {
      return (x + 1) * 2
    }
  }, new Queue(2))

  const p1 = gen.next()

  bd[1].resolve()
  await asyncDelay()
  bd[0].resolve()

  try {
    await p1
    expect(false).toBe(true)
  } catch (e) {
    expect(e instanceof TestError).toBe(true)
  }
})

test('asyncGeneratorMap fail process second', async () => {
  const bd = [...range(2)].map(() => new Deferred())
  const gen = asyncGeneratorMap(range(2), async (x, i) => {
    await bd[i].promise
    if (i === 1) {
      throw new TestError()
    } else {
      return (x + 1) * 2
    }
  }, new Queue(2))

  const p1 = gen.next()

  bd[1].resolve()
  await asyncDelay()
  bd[0].resolve()

  const res = await p1

  expect(res.done).toStrictEqual(false)
  expect(res.value).toStrictEqual(2)

  const p2 = gen.next()

  try {
    await p2
    expect(false).toBe(true)
  } catch (e) {
    expect(e instanceof TestError).toBe(true)
  }
})

test('asyncGeneratorMap fail fetch first unordered', async () => {
  const bd = [...range(2)].map(() => new Deferred())
  const originGen = asyncGeneratorMap(range(2), async (x, i) => {
    await bd[i].promise
    if (i === 0) {
      throw new TestError()
    } else {
      return x
    }
  }, new Queue(2))

  const gen = asyncGeneratorMap(originGen, async (x) => {
    return (x + 1) * 2
  }, new Queue(2), false)

  const p1 = gen.next()

  bd[1].resolve()
  await asyncDelay()
  bd[0].resolve()

  try {
    await p1
    expect(false).toBe(true)
  } catch (e) {
    expect(e instanceof TestError).toBe(true)
  }
})

test('asyncGeneratorMap fail fetch second unordered', async () => {
  const originGen = asyncGeneratorMap(range(2), async (x, i) => {
    if (i === 1) {
      throw new TestError()
    } else {
      return x
    }
  }, new Queue(2))

  const bd = [...range(2)].map(() => new Deferred())
  const gen = asyncGeneratorMap(originGen, async (x, i) => {
    await bd[i].promise
    return (x + 1) * 2
  }, new Queue(2), false)

  const p1 = gen.next().then((r) => ['resolved', r], (e) => ['rejected', e])

  await asyncDelay()

  bd[0].resolve()

  const [state, result] = await p1

  expect(state).toStrictEqual('rejected')
  expect(result instanceof TestError).toBe(true)
})

test('asyncGeneratorMap fail process first unordered', async () => {
  const bd = [...range(2)].map(() => new Deferred())
  const gen = asyncGeneratorMap(range(2), async (x, i) => {
    await bd[i].promise
    if (i === 0) {
      throw new TestError()
    } else {
      return (x + 1) * 2
    }
  }, new Queue(2), false)

  const p1 = gen.next()

  bd[1].resolve()
  const res = await p1
  expect(res.done).toStrictEqual(false)
  expect(res.value).toStrictEqual(4)

  const p2 = gen.next()

  bd[0].resolve()

  try {
    await p2
    expect(false).toBe(true)
  } catch (e) {
    expect(e instanceof TestError).toBe(true)
  }
})

test('asyncGeneratorMap fail process second unordered', async () => {
  const bd = [...range(2)].map(() => new Deferred())
  const gen = asyncGeneratorMap(range(2), async (x, i) => {
    await bd[i].promise
    if (i === 1) {
      throw new TestError()
    } else {
      return (x + 1) * 2
    }
  }, new Queue(2), false)

  const p1 = gen.next()

  bd[1].resolve()

  try {
    await p1
    expect(false).toBe(true)
  } catch (e) {
    expect(e instanceof TestError).toBe(true)
  }
})

test('asyncGeneratorMap unordered fail in fetch', async () => {
  const originGen = asyncGeneratorMap(range(2), async (x, i) => {
    throw new TestError()
  }, Number.POSITIVE_INFINITY)

  const callList = []
  const gen = asyncGeneratorMap(originGen, async (x, i) => {
    callList.push(i)
    return (x + 1) * 2
  }, 1, false)

  const p1 = gen.next().then((r) => ['resolved', r], (e) => ['rejected', e])
  const [state, result] = await p1
  expect(state).toStrictEqual('rejected')
  expect(result).toBeInstanceOf(TestError)

  await asyncDelay()
  expect(callList).toStrictEqual([])
})

test('asyncGeneratorMap cancel scheduled busy queue', async () => {
  const queue = new Queue(100)
  const d = new Deferred()
  const waiting = [...range(99)].map(() => {
    return queue.exec(async () => await d.promise)
  })
  const callList = []
  const gen = asyncGeneratorMap(range(100), async (x, i) => {
    callList.push(i)
    await asyncSleep(1)
    if (i === 50) {
      throw new TestError()
    }
    return x
  }, queue)

  const [state, result] = await asyncIterableToArray(gen).then((r) => ['resolved', r], (e) => ['rejected', e])
  expect(state).toStrictEqual('rejected')
  expect(result).toBeInstanceOf(TestError)

  d.resolve()
  await Promise.all(waiting)
  await asyncDelay()

  expect(callList).toStrictEqual([...range(51)])
})

test('asyncGeneratorMap infinite sync operator', async () => {
  let shouldStop = false
  const infiniteSyncGenerator = function * () {
    let i = 0
    while (true) {
      if (shouldStop) {
        return
      }
      yield i
      i += 1
    }
  }
  const results = []
  for await (const el of asyncGeneratorMap(infiniteSyncGenerator(), async (el) => {
    await asyncSleep(1)
    if (el === 10) {
      shouldStop = true
    }
    return el * 2
  })) {
    results.push(el)
  }
  expect(shouldStop).toStrictEqual(true)
  expect(results.length).toBeGreaterThanOrEqual(1)
  expect(results[0]).toStrictEqual(0)
  expect(results[1]).toStrictEqual(2)
  expect(results[2]).toStrictEqual(4)
})

test('asyncGeneratorMap blocks when concurrency reached', async () => {
  const callList = []
  const d = new Deferred()
  const p = asyncIterableToArray(asyncGeneratorMap(range(10), async (el, i) => {
    callList.push(i)
    await d.promise
    return el
  }, 3))
  await asyncDelay()
  expect(callList).toStrictEqual([0, 1, 2])
  d.resolve()
  const result = await p
  expect(result).toStrictEqual(await asyncIterableToArray(range(10)))
})

test('asyncGeneratorMap reaches concurrency', async () => {
  const expectedConcurrency = 10
  let currentConcurrency = 0
  let maxConcurrency = 0
  const d = new Deferred()
  const p = asyncIterableToArray(asyncGeneratorMap(range(100), async (el, i) => {
    currentConcurrency += 1
    maxConcurrency = Math.max(maxConcurrency, currentConcurrency)
    await d.promise
    currentConcurrency -= 1
    maxConcurrency = Math.max(maxConcurrency, currentConcurrency)
    return el
  }, expectedConcurrency))
  await asyncDelay()
  expect(maxConcurrency).toStrictEqual(expectedConcurrency)
  d.resolve()
  const result = await p
  expect(maxConcurrency).toStrictEqual(expectedConcurrency)
  expect(result).toStrictEqual(await asyncIterableToArray(range(100)))
})

test('common for await interrupts generator on interrupted iteration', async () => {
  let finallyReached = false

  async function * asyncGenWithFinally () {
    try {
      for (const element of range(10)) {
        yield element
      }
    } finally {
      finallyReached = true
    }
  }

  for await (const n of asyncGenWithFinally()) {
    if (n === 2) {
      break
    }
  }

  expect(finallyReached).toBe(true)
})

test('common for await calls AsyncGenerator.return() not AsyncGenerator.throw()', async () => {
  let catchedException = null

  async function * asyncGenWithFinally () {
    try {
      for (const element of range(10)) {
        yield element
      }
    } catch (e) {
      catchedException = e
    }
  }

  try {
    for await (const n of asyncGenWithFinally()) {
      if (n === 2) {
        throw new TestError()
      }
    }
  } catch (e) {
    expect(e instanceof TestError).toBe(true)
  }
  expect(catchedException).toBe(null)
})

test('asyncGeneratorMap interrupts generator on interrupted iteration', async () => {
  let finallyReached = false

  async function * asyncGenWithFinally () {
    try {
      for (const element of range(10)) {
        yield element
      }
    } finally {
      finallyReached = true
    }
  }

  for await (const n of asyncGeneratorMap(asyncGenWithFinally(), n => n * 2)) {
    if (n === 4) {
      break
    }
  }
  expect(finallyReached).toBe(true)
})
