
import { expect, test } from '@jest/globals'
import preciseWait from './preciseWait'

test('preciseWait', async () => {
  const start = new Date().getTime()
  await preciseWait(100)
  const end = new Date().getTime()
  expect(end - start).toBeGreaterThanOrEqual(100)
})
