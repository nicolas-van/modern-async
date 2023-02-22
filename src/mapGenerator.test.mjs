
import { expect, test } from '@jest/globals'
import mapGenerator from './mapGenerator.mjs'
import { range } from 'itertools'
import delay from './delay.mjs'
import Queue from './Queue.mjs'
import Deferred from './Deferred.mjs'
import sleep from './sleep'
import toArray from './toArray.mjs'

// eslint-disable-next-line require-jsdoc
class TestError extends Error {}

test('mapGenerator base', async () => {
  const res = []
  for await (const el of mapGenerator(range(6), async (x) => x * 2, new Queue(1))) {
    res.push(el)
  }
  expect(res).toEqual([0, 2, 4, 6, 8, 10])
})

test('mapGenerator all resolve in micro tasks', async () => {
  const del = delay()
  const gen = mapGenerator(range(6), async (x) => x, new Queue(1))
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

test('mapGenerator infinity all resolve in micro tasks', async () => {
  const del = delay()
  const gen = mapGenerator(range(6), async (x) => x, new Queue(Number.POSITIVE_INFINITY))
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

test('mapGenerator same queue one level concurrency 1 random delays', async () => {
  const queue = new Queue(10)
  const gen1 = mapGenerator(range(1000), async (x, i) => {
    await sleep(Math.floor(Math.random() * 10))
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

test('mapGenerator same queue one level concurrency 10 random delays', async () => {
  const queue = new Queue(10)
  const gen1 = mapGenerator(range(1000), async (x, i) => {
    await sleep(Math.floor(Math.random() * 10))
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

test('mapGenerator same queue one level concurrency 3 busy queue random delays', async () => {
  const queue = new Queue(10)
  ;[...range(7)].forEach(element => {
    queue.exec(async () => new Promise(() => {}))
  })
  const gen1 = mapGenerator(range(1000), async (x, i) => {
    await sleep(Math.floor(Math.random() * 10))
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

test('mapGenerator same queue three levels concurrency 1', async () => {
  const callList = []
  const queue = new Queue(1)
  const gen1 = mapGenerator(range(3), async (x, i) => {
    callList.push([0, i])
    return x * 2
  }, queue)
  const gen2 = mapGenerator(gen1, async (x, i) => {
    callList.push([1, i])
    return x * 2
  }, queue)
  const gen3 = mapGenerator(gen2, async (x, i) => {
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

test('mapGenerator same queue three levels concurrency 2', async () => {
  const callList = []
  const queue = new Queue(2)
  const gen1 = mapGenerator(range(3), async (x, i) => {
    callList.push([0, i])
    return x * 2
  }, queue)
  const gen2 = mapGenerator(gen1, async (x, i) => {
    callList.push([1, i])
    return x * 2
  }, queue)
  const gen3 = mapGenerator(gen2, async (x, i) => {
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

test('mapGenerator same queue three levels concurrency infinity', async () => {
  const callList = []
  const queue = new Queue(Number.POSITIVE_INFINITY)
  const gen1 = mapGenerator(range(3), async (x, i) => {
    callList.push([0, i])
    return x * 2
  }, queue)
  const gen2 = mapGenerator(gen1, async (x, i) => {
    callList.push([1, i])
    return x * 2
  }, queue)
  const gen3 = mapGenerator(gen2, async (x, i) => {
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

test('mapGenerator same queue three levels concurrency 1 random delays', async () => {
  const queue = new Queue(1)
  const gen1 = mapGenerator(range(100), async (x, i) => {
    await sleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const gen2 = mapGenerator(gen1, async (x, i) => {
    await sleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const gen3 = mapGenerator(gen2, async (x, i) => {
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
  expect(res).toStrictEqual([...range(100)].map((x) => x * 8))
})

test('mapGenerator same queue three levels concurrency 5 random delays', async () => {
  const queue = new Queue(5)
  const gen1 = mapGenerator(range(100), async (x, i) => {
    await sleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue, true)
  const gen2 = mapGenerator(gen1, async (x, i) => {
    await sleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue, true)
  const gen3 = mapGenerator(gen2, async (x, i) => {
    await sleep(Math.floor(Math.random() * 10))
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

test('mapGenerator same queue three levels infinity random delays', async () => {
  const queue = new Queue(Number.POSITIVE_INFINITY)
  const gen1 = mapGenerator(range(100), async (x, i) => {
    await sleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const gen2 = mapGenerator(gen1, async (x, i) => {
    await sleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const gen3 = mapGenerator(gen2, async (x, i) => {
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
  expect(res).toStrictEqual([...range(100)].map((x) => x * 8))
})

test('mapGenerator same queue three levels busy queue random delays ', async () => {
  const queue = new Queue(10)
  ;[...range(7)].forEach(element => {
    queue.exec(async () => new Promise(() => {}))
  })
  const gen1 = mapGenerator(range(100), async (x, i) => {
    await sleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const gen2 = mapGenerator(gen1, async (x, i) => {
    await sleep(Math.floor(Math.random() * 10))
    return x * 2
  }, queue)
  const gen3 = mapGenerator(gen2, async (x, i) => {
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
  expect(res).toStrictEqual([...range(100)].map((x) => x * 8))
})

test('mapGenerator fail fetch first', async () => {
  const bd = [...range(2)].map(() => new Deferred())
  const originGen = mapGenerator(range(2), async (x, i) => {
    await bd[i].promise
    if (i === 0) {
      throw new TestError()
    } else {
      return x
    }
  }, new Queue(2))

  const gen = mapGenerator(originGen, async (x) => {
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

test('mapGenerator fail fetch second', async () => {
  const bd = [...range(2)].map(() => new Deferred())
  const originGen = mapGenerator(range(2), async (x, i) => {
    await bd[i].promise
    if (i === 1) {
      throw new TestError()
    } else {
      return x
    }
  }, new Queue(2))

  const gen = mapGenerator(originGen, async (x) => {
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

test('mapGenerator fail process first', async () => {
  const bd = [...range(2)].map(() => new Deferred())
  const gen = mapGenerator(range(2), async (x, i) => {
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

test('mapGenerator fail process second', async () => {
  const bd = [...range(2)].map(() => new Deferred())
  const gen = mapGenerator(range(2), async (x, i) => {
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

test('mapGenerator fail fetch first unordered', async () => {
  const bd = [...range(2)].map(() => new Deferred())
  const originGen = mapGenerator(range(2), async (x, i) => {
    await bd[i].promise
    if (i === 0) {
      throw new TestError()
    } else {
      return x
    }
  }, new Queue(2))

  const gen = mapGenerator(originGen, async (x) => {
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

test('mapGenerator fail fetch second unordered', async () => {
  const originGen = mapGenerator(range(2), async (x, i) => {
    if (i === 1) {
      throw new TestError()
    } else {
      return x
    }
  }, new Queue(2))

  const bd = [...range(2)].map(() => new Deferred())
  const gen = mapGenerator(originGen, async (x, i) => {
    await bd[i].promise
    return (x + 1) * 2
  }, new Queue(2), false)

  const p1 = gen.next().then((r) => ['resolved', r], (e) => ['rejected', e])

  await delay()

  bd[0].resolve()

  const [state, result] = await p1

  expect(state).toStrictEqual('rejected')
  expect(result instanceof TestError).toBe(true)
})

test('mapGenerator fail process first unordered', async () => {
  const bd = [...range(2)].map(() => new Deferred())
  const gen = mapGenerator(range(2), async (x, i) => {
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

test('mapGenerator fail process second unordered', async () => {
  const bd = [...range(2)].map(() => new Deferred())
  const gen = mapGenerator(range(2), async (x, i) => {
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

test('mapGenerator unordered fail in fetch', async () => {
  const originGen = mapGenerator(range(2), async (x, i) => {
    throw new TestError()
  }, Number.POSITIVE_INFINITY)

  const callList = []
  const gen = mapGenerator(originGen, async (x, i) => {
    callList.push(i)
    return (x + 1) * 2
  }, 1, false)

  const p1 = gen.next().then((r) => ['resolved', r], (e) => ['rejected', e])
  const [state, result] = await p1
  expect(state).toStrictEqual('rejected')
  expect(result).toBeInstanceOf(TestError)

  await delay()
  expect(callList).toStrictEqual([])
})

test('mapGenerator cancel scheduled busy queue', async () => {
  const queue = new Queue(100)
  const d = new Deferred()
  const waiting = [...range(99)].map(() => {
    return queue.exec(async () => await d.promise)
  })
  const callList = []
  const gen = mapGenerator(range(100), async (x, i) => {
    callList.push(i)
    await sleep(1)
    if (i === 50) {
      throw new TestError()
    }
    return x
  }, queue)

  const [state, result] = await toArray(gen).then((r) => ['resolved', r], (e) => ['rejected', e])
  expect(state).toStrictEqual('rejected')
  expect(result).toBeInstanceOf(TestError)

  d.resolve()
  await Promise.all(waiting)
  await delay()

  expect(callList).toStrictEqual([...range(51)])
})

test('mapGenerator infinite sync operator', async () => {
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
  for await (const el of mapGenerator(infiniteSyncGenerator(), async (el) => {
    await sleep(1)
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

test('mapGenerator respect concurrency', async () => {
  const callList = []
  const d = new Deferred()
  const p = toArray(mapGenerator(range(10), async (el, i) => {
    callList.push(i)
    await d.promise
    return el
  }, 3))
  await delay()
  expect(callList).toStrictEqual([0, 1, 2])
  d.resolve()
  const result = await p
  expect(result).toStrictEqual(await toArray(range(10)))
})
