
import * as modernAsync from './modern-async.mjs'
import { expect, test } from '@jest/globals'

test('import', () => {
  expect(modernAsync).toBeDefined()
})
