
import { expect, test } from '@jest/globals'
import waitPrecise from './waitPrecise'

test('waitPrecise', async () => {
  const start = new Date().getTime()
  await waitPrecise(100)
  const end = new Date().getTime()
  expect(end - start).toBeGreaterThanOrEqual(100)
})
