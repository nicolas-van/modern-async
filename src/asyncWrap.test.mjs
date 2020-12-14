
import { expect, test } from '@jest/globals'
import { AssertionError } from 'assert'
import asyncWrap from './asyncWrap.mjs'

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

test('asyncWrap arguments', async () => {
  const fct = (a, b) => {
    return a + b
  }
  const p = asyncWrap(fct)(1, 2)
  expect(p).toBeInstanceOf(Promise)
  expect(await p).toBe(3)
})
