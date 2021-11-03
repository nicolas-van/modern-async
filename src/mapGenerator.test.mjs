
import { expect, test } from '@jest/globals'
import mapGenerator from './mapGenerator.mjs'
import { range } from 'itertools'
import delay from './delay.mjs'
import Queue from './Queue.mjs'
import Deferred from './Deferred.mjs'
import sleep from './sleep'

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

test('mapGenerator unordered fail in fetch cancels sheduled tasks', async () => {
  const originGen = mapGenerator(range(2), async (x, i) => {
    if (i === 1) {
      throw new TestError()
    } else {
      return x
    }
  }, Number.POSITIVE_INFINITY)

  const queue = new Queue(1)
  const d = new Deferred()
  queue.exec(async () => {
    await d.promise
  })
  const callList = []
  const gen = mapGenerator(originGen, async (x, i) => {
    callList.push(i)
    return (x + 1) * 2
  }, queue, false)

  const p1 = gen.next().then((r) => ['resolved', r], (e) => ['rejected', e])
  const [state, result] = await p1
  expect(state).toStrictEqual('rejected')
  expect(result).toBeInstanceOf(TestError)

  d.resolve()
  await delay()
  expect(callList).toStrictEqual([])
})
