
import { test, expect } from '@jest/globals'
import delay from './delay.mjs'

test('delay', async () => {
  const events = []
  const p = delay().then(() => {
    events.push('resolved')
  })
  Promise.resolve().then(() => {
    events.push('microtask')
  })

  await p
  expect(events).toStrictEqual(['microtask', 'resolved'])
})
