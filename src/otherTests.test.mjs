
import { expect, test } from '@jest/globals'
import Deferred from './Deferred.mjs'

test('then is not immediate', async () => {
  const d = new Deferred()
  let started = false
  let ended = false
  const p = (() => {
    started = true
    return d.promise.then(() => {
      ended = true
    })
  })()
  expect(started).toBe(true)
  expect(ended).toBe(false)
  d.resolve()
  expect(ended).toBe(false)
  await p
  expect(ended).toBe(true)
})

test('await is not immediate', async () => {
  const d = new Deferred()
  let started = false
  let ended = false
  const p = (async () => {
    started = true
    await d
    ended = true
  })()
  expect(started).toBe(true)
  expect(ended).toBe(false)
  d.resolve()
  expect(ended).toBe(false)
  await p
  expect(ended).toBe(true)
})

test('already resolved then is not immediate', async () => {
  const x = Promise.resolve()
  let started = false
  let ended = false
  const p = (() => {
    started = true
    return x.then(() => {
      ended = true
    })
  })()
  expect(started).toBe(true)
  expect(ended).toBe(false)
  await p
  expect(ended).toBe(true)
})

test('already resolved await is not immediate', async () => {
  const x = Promise.resolve()
  let started = false
  let ended = false
  const p = (async () => {
    started = true
    await x
    ended = true
  })()
  expect(started).toBe(true)
  expect(ended).toBe(false)
  await p
  expect(ended).toBe(true)
})

test('async call is immediate', async () => {
  const calls = []
  const fct = async () => {
    calls.push('call')
  }
  const p = fct()
  calls.push('after call')
  await p
  expect(calls).toStrictEqual(['call', 'after call'])
})

test('async await call is not in micro task', async () => {
  const calls = []
  queueMicrotask(() => {
    calls.push('micro task')
  })
  const fct = async () => {
    calls.push('call')
  }
  await fct()
  expect(calls).toStrictEqual(['call', 'micro task'])
})

test('async catch is not immediate', async () => {
  const calls = []
  const fct = async () => {
    calls.push('call')
    throw new Error()
  }
  const p = fct()
  calls.push('after call')
  try {
    await p
  } catch (e) {
    calls.push('catch')
  }
  expect(calls).toStrictEqual(['call', 'after call', 'catch'])
})
