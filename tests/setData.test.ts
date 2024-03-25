import { test, expect } from 'vitest'
import { get } from 'svelte/store'
import { createIvvyManager } from '../'

test('Should support data updates', () => {
  type Data = {
    name: string
    age: number
    married: boolean
  }
  const manager = createIvvyManager<Data>({
    initialData: {
      name: 'ivvy',
      age: 21,
      married: false
    }
  })
  expect(get(manager.isValid)).toBe(true)
  expect(get(manager.errors)).toEqual({})
  expect(get(manager.data)).toEqual({ name: 'ivvy', age: 21, married: false })

  manager.setData({ name: 'iv', age: 10 })

  expect(get(manager.isValid)).toBe(true)
  expect(get(manager.errors)).toEqual({})
  expect(get(manager.data)).toEqual({
    name: 'iv',
    age: 10,
    married: false // Same as before.
  })
})
