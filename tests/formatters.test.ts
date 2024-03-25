import { test, expect } from 'vitest'
import { get } from 'svelte/store'
import { createIvvyManager } from '../'

test('Should accept formatters to pre-process data source updates', () => {
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
    },
    formatters: {
      name: (value) => String(value).toUpperCase(),
      age: (value) => Number(value) * 2
    }
  })
  expect(get(manager.isValid)).toBe(true)
  expect(get(manager.errors)).toEqual({})
  expect(get(manager.data)).toEqual({
    name: 'IVVY',
    age: 42,
    married: false
  })

  manager.setData({
    name: 'iv'
  })
  expect(get(manager.isValid)).toBe(true)
  expect(get(manager.errors)).toEqual({})
  expect(get(manager.data)).toEqual({
    name: 'IV',
    age: 42,
    married: false
  })
})
