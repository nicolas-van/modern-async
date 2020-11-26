
import { expect, test } from '@jest/globals'
import Queue from './Queue'
import preciseWait from './preciseWait'
import _ from 'lodash'

/*
test('Queue base 1', async () => {
  const unit = 30
  const start = new Date().getTime()
  const queue = new Queue(1)
  expect(queue.running).toBe(0)
  expect(queue.pending).toBe(0)
  const promises = []
  // eslint-disable-next-line no-unused-vars
  for (const x of _.range(3)) {
    const p = queue.exec(async () => {
      await preciseWait(30)
    })
    expect(p).toBeInstanceOf(Promise)
    promises.push(p)
  }
  expect(promises.length).toBe(3)
  expect(queue.running).toBe(1)
  expect(queue.pending).toBe(2)
  await promises[0]
  expect(queue.running).toBe(1)
  expect(queue.pending).toBe(1)
  let now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 1)
  expect(now - start).toBeLessThan(unit * 1 * 5)
  await promises[1]
  expect(queue.running).toBe(1)
  expect(queue.pending).toBe(0)
  now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 2)
  expect(now - start).toBeLessThan(unit * 2 * 5)
  await promises[2]
  expect(queue.running).toBe(0)
  expect(queue.pending).toBe(0)
  now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 3)
  expect(now - start).toBeLessThan(unit * 3 * 5)
})
*/
test('Queue base 2', async () => {
  const unit = 30
  const start = new Date().getTime()
  const queue = new Queue(2)
  expect(queue.running).toBe(0)
  expect(queue.pending).toBe(0)
  const promises = []
  // eslint-disable-next-line no-unused-vars
  for (const x of _.range(6)) {
    const p = queue.exec(async () => {
      await preciseWait(30)
    })
    expect(p).toBeInstanceOf(Promise)
    promises.push(p)
  }
  expect(promises.length).toBe(6)
  expect(queue.running).toBe(2)
  expect(queue.pending).toBe(4)
  await promises[0]
  await promises[1]
  expect(queue.running).toBe(2)
  expect(queue.pending).toBe(2)
  let now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 1)
  expect(now - start).toBeLessThan(unit * 1 * 5)
  await promises[2]
  await promises[3]
  expect(queue.running).toBe(2)
  expect(queue.pending).toBe(0)
  now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 2)
  expect(now - start).toBeLessThan(unit * 2 * 5)
  await promises[4]
  await promises[5]
  expect(queue.running).toBe(0)
  expect(queue.pending).toBe(0)
  now = new Date().getTime()
  expect(now - start).toBeGreaterThanOrEqual(unit * 3)
  expect(now - start).toBeLessThan(unit * 3 * 5)
})
