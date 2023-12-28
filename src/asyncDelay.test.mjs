
import { test, expect } from '@jest/globals'
import asyncDelay from './asyncDelay.mjs'

test('asyncDelay', async () => {
  const events = []
  const p = asyncDelay().then(() => {
    events.push('resolved')
  })
  Promise.resolve().then(() => {
    events.push('microtask')
  })

  await p
  expect(events).toStrictEqual(['microtask', 'resolved'])
})
