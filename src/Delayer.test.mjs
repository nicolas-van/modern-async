
import { expect, test } from '@jest/globals'
import Delayer from './Delayer.mjs'

test('Delayer', async () => {
  const unit = 10
  const start = new Date().getTime()
  const d = new Delayer(unit)
  let loopCount = 0
  let delayCount = 0
  let x = 0
  let tmp
  while (true) {
    loopCount += 1
    tmp = x * 2
    x += 1
    const delayed = await d.checkDelay()
    if (delayed) {
      delayCount += 1
    }
    if (delayCount >= 3) {
      break
    }
  }
  expect(loopCount).toBeDefined()
  expect(tmp).toBeDefined()
  const end = new Date().getTime()
  const time = end - start
  expect(time).toBeGreaterThanOrEqual(unit * 3)
})
