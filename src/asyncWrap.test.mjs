
import { expect, test } from '@jest/globals'
import { AssertionError } from 'assert'
import asyncWrap from './asyncWrap.mjs'
import Deferred from './Deferred.mjs'

test('asyncWrap problem', () => {
  const fct = () => {
    throw new AssertionError({})
  }
  expect(() => {
    Promise.resolve(fct())
  }).toThrowError(AssertionError)
})

test('asyncWrap resolve', async () => {
  const fct = () => {
    return 'test'
  }
  const p = asyncWrap(fct)()
  expect(p).toBeInstanceOf(Promise)
  expect(await p).toBe('test')
})

test('asyncWrap resolve async', async () => {
  const d = new Deferred()
  const fct = async () => {
    await d.promise
    return 'test'
  }
  const p = asyncWrap(fct)()
  expect(p).toBeInstanceOf(Promise)
  d.resolve()
  expect(await p).toBe('test')
})

test('asyncWrap throws', async () => {
  const fct = () => {
    throw new Error('test')
  }
  const p = asyncWrap(fct)()
  expect(p).toBeInstanceOf(Promise)
  const catched = await p.catch(() => {
    return true
  })
  expect(catched).toBe(true)
})

test('asyncWrap throws async', async () => {
  const d = new Deferred()
  const fct = async () => {
    await d.promise
    throw new Error('test')
  }
  const p = asyncWrap(fct)()
  expect(p).toBeInstanceOf(Promise)
  d.resolve()
  const catched = await p.catch(() => {
    return true
  })
  expect(catched).toBe(true)
})

test('asyncWrap arguments', async () => {
  const fct = (a, b) => {
    return a + b
  }
  const p = asyncWrap(fct)(1, 2)
  expect(p).toBeInstanceOf(Promise)
  expect(await p).toBe(3)
})

test('asyncWrap arguments async', async () => {
  const d = new Deferred()
  const fct = async (a, b) => {
    await d.promise
    return a + b
  }
  const p = asyncWrap(fct)(1, 2)
  expect(p).toBeInstanceOf(Promise)
  d.resolve()
  expect(await p).toBe(3)
})
