import { test, expect } from 'vitest'
import { get } from 'svelte/store'
import { y } from 'yrel'
import { createIvvyManager } from '../'

test('Should support data destroy', () => {
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
    validators: {
      age: y.number()
    }
  })
  expect(get(manager.isValid)).toBe(true)
  expect(get(manager.errors)).toEqual({})
  expect(get(manager.data)).toEqual({ name: 'ivvy', age: 21, married: false })
  expect(get(manager.isTouched)).toBe(false)
  expect(get(manager.touches)).toEqual({})

  manager.isTouched.set(true)
  manager.touches.set({ age: true })
  manager.setData({ name: 'iv', age: 'x' as any, married: true })
  expect(get(manager.isValid)).toBe(false)
  expect(get(manager.errors)).toEqual({ age: ['err_number'] })
  expect(get(manager.data)).toEqual({ name: 'iv', age: 'x', married: true })

  manager.destroy()
  expect(get(manager.isValid)).toBe(true)
  expect(get(manager.errors)).toEqual({})
  expect(get(manager.data)).toEqual({ name: 'ivvy', age: 21, married: false })
  expect(get(manager.isTouched)).toBe(false)
  expect(get(manager.touches)).toEqual({})
})
