
import { expect, test } from '@jest/globals'
import asyncGeneratorMap from './asyncGeneratorMap.mjs'
import { range } from 'itertools'
import delay from './delay.mjs'
import Queue from './Queue.mjs'
import Deferred from './Deferred.mjs'
import sleep from './sleep'

test('asyncGeneratorMap base', async () => {
  const res = []
  for await (const el of asyncGeneratorMap(range(6), async (x) => x * 2, new Queue(1))) {
    res.push(el)
  }
  expect(res).toEqual([0, 2, 4, 6, 8, 10])
})

test('asyncGeneratorMap all resolve in micro tasks', async () => {
  const del = delay()
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
  const del = delay()
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
  expect(callList).toStrictEqual([
    [0, 0],
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [0, 2],
    [1, 2],
    [2, 2]
  ])
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
  const gen1 = asyncGeneratorMap(range(10), async (x, i) => {
    await sleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const gen2 = asyncGeneratorMap(gen1, async (x, i) => {
    await sleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const gen3 = asyncGeneratorMap(gen2, async (x, i) => {
    await sleep(Math.floor(Math.random() * 10))
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
  expect(res).toStrictEqual([0, 8, 16, 24, 32, 40, 48, 56, 64, 72])
})

test('asyncGeneratorMap same queue three levels concurrency 1 random delays busy queue', async () => {
  const queue = new Queue(10)
  ;[...range(8)].forEach(element => {
    queue.exec(async () => new Promise(() => {}))
  })
  const gen1 = asyncGeneratorMap(range(10), async (x, i) => {
    await sleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const gen2 = asyncGeneratorMap(gen1, async (x, i) => {
    await sleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const gen3 = asyncGeneratorMap(gen2, async (x, i) => {
    await sleep(Math.floor(Math.random() * 10))
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
  expect(res).toStrictEqual([0, 8, 16, 24, 32, 40, 48, 56, 64, 72])
})

test('findIndexLimit cancelSubsequent busy queue', async () => {
  const findIndexLimit = async (iterable, iteratee, queue) => {
    for await (const [index, pass] of asyncGeneratorMap(iterable, async (value, index, iterable) => {
      return [index, await iteratee(value, index, iterable)]
    }, queue)) {
      if (pass) {
        return index
      }
    }
    return -1
  }

  // setup full queue
  const queue = new Queue(3)
  const qd = [...range(3)].map(() => new Deferred())
  for (const i of range(3)) {
    queue.exec(async () => {
      await qd[i].promise
    })
  }

  const callCount = {}
  ;[...range(10)].forEach((i) => { callCount[i] = 0 })
  const d = new Deferred()
  const ds = [...range(10)].map(() => new Deferred())
  const p = findIndexLimit([...range(10)], async (v, i) => {
    callCount[i] += 1
    ds[i].resolve()
    await d.promise
    return v === 1
  }, queue)
  await delay()
  expect(callCount[0]).toBe(0)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
  qd[0].resolve()
  await ds[0].promise
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(0)
  expect(callCount[2]).toBe(0)
  d.resolve()
  const res = await p
  expect(res).toBe(1)
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(0)
  await delay()
  expect(callCount[0]).toBe(1)
  expect(callCount[1]).toBe(1)
  expect(callCount[2]).toBe(0)
  expect(queue.running).toStrictEqual(2)
  expect(queue.pending).toStrictEqual(0)
  queue.cancelAllPending()
})

/**
 * @ignore
 */
class TestError extends Error {}

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
  await delay()
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
  await delay()
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
  await delay()
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
  await delay()
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
  await delay()
  bd[0].resolve()

  try {
    await p1
    expect(false).toBe(true)
  } catch (e) {
    expect(e instanceof TestError).toBe(true)
  }
})

test('asyncGeneratorMap fail fetch second unordered', async () => {
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
  }, new Queue(2), false)

  const p1 = gen.next()

  bd[1].resolve()
  bd[0].resolve()

  try {
    await p1
    expect(false).toBe(true)
  } catch (e) {
    expect(e instanceof TestError).toBe(true)
  }
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

test('asyncGeneratorMap fail in fetch cancels sheduled tasks', async () => {
  const originGen = asyncGeneratorMap(range(2), async (x, i) => {
    if (i === 1) {
      throw new TestError()
    } else {
      return x
    }
  }, new Queue(2))

  const queue = new Queue(2)
  queue.exec(async () => {
    await new Promise(() => {})
  })
  const d = new Deferred()
  queue.exec(async () => {
    await d.promise
  })
  const callList = []
  const gen = asyncGeneratorMap(originGen, async (x, i) => {
    callList.push(i)
    return (x + 1) * 2
  }, queue, false)

  const p1 = gen.next()

  try {
    await p1
    expect(false).toBe(true)
  } catch (e) {
    expect(e instanceof TestError).toBe(true)
  }
  d.resolve()
  await delay()
  expect(callList).toStrictEqual([])
})
