
import { expect, test } from '@jest/globals'
import reflectStatus from './reflectStatus.mjs'
import asyncDelay from './asyncDelay.mjs'

test('reflectStatus base test', async () => {
  const res1 = await reflectStatus(async () => {
    await asyncDelay()
    return 3
  })

  expect(typeof (res1) === 'object').toBeTruthy()
  expect(res1.status).toStrictEqual('fulfilled')
  expect(res1.value).toStrictEqual(3)
  expect(res1.reason).toBeUndefined()
})

test('reflectStatus falure', async () => {
  const res1 = await reflectStatus(async () => {
    await asyncDelay()
    throw new Error('error')
  })

  expect(typeof (res1) === 'object').toBeTruthy()
  expect(res1.status).toStrictEqual('rejected')
  expect(res1.value).toBeUndefined()
  expect(res1.reason).toBeInstanceOf(Error)
  expect(res1.reason.message).toStrictEqual('error')
})
