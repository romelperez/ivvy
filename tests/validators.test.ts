import { test, expect } from 'vitest'
import { get } from 'svelte/store'
import { type InferYrel, y } from 'yrel'
import { createIvvyManager } from '../'

test('Should initially be valid if no validators are provided', () => {
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
})

test('Should initially be untouched', () => {
  type Data = {
    name: string
  }
  const manager = createIvvyManager<Data>({
    initialData: {
      name: 'ivvy'
    }
  })
  expect(get(manager.isTouched)).toBe(false)
  expect(get(manager.touches)).toEqual({})
})

test('Should initially have data with initialData', () => {
  type Data = {
    name: string
  }
  const manager = createIvvyManager<Data>({
    initialData: {
      name: 'ivvy'
    }
  })
  expect(get(manager.data)).toEqual({
    name: 'ivvy'
  })
})

test('Should accept inline-validators', () => {
  type Data = {
    name: string
    age: number
    married: boolean
  }
  const manager = createIvvyManager<Data>({
    initialData: {
      name: 'ivvy',
      age: 21,
      married: true
    },
    validators: {
      name: ({ name }) => name.length > 2 || ['my_error_string_min'],
      age: ({ age }) => age > 18 || ['my_error_number_gte'],
      married: ({ married }) => married || ['my_error_boolean']
    }
  })
  expect(get(manager.isValid)).toBe(true)

  manager.setData({ name: 'i', age: 2, married: true })
  expect(get(manager.isValid)).toBe(false)
  expect(get(manager.errors)).toEqual({
    name: ['my_error_string_min'],
    age: ['my_error_number_gte']
  })
})

test('Should accept yrel object schema as validators', () => {
  const schema = y.object({
    name: y.string().min(2).max(10),
    age: y.number().gte(18).lte(100),
    married: y.boolean()
  })
  type Data = InferYrel<typeof schema>
  const manager = createIvvyManager<Data>({
    initialData: {
      name: 'ivvy',
      age: 21,
      married: false
    },
    validators: schema
  })
  expect(get(manager.isValid)).toBe(true)
  expect(get(manager.errors)).toEqual({})

  manager.setData({ name: 'i', age: 2, married: true })
  expect(get(manager.isValid)).toBe(false)
  expect(get(manager.errors)).toEqual({
    name: ['err_string_min'],
    age: ['err_number_gte']
  })
})

test('Should accept object of yrel schemas as validators ', () => {
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
      name: y.string().min(2).max(10),
      age: y.number().gte(18).lte(100),
      married: y.boolean()
    }
  })
  expect(get(manager.isValid)).toBe(true)
  expect(get(manager.errors)).toEqual({})

  manager.setData({ name: 'i', age: 2, married: true })
  expect(get(manager.isValid)).toBe(false)
  expect(get(manager.errors)).toEqual({
    name: ['err_string_min'],
    age: ['err_number_gte']
  })
})

test('Should accept yrel schemas as validators functions', () => {
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
      name: () => y.string().min(2).max(10),
      age: () => y.number().gte(18).lte(100),
      married: () => y.boolean()
    }
  })
  expect(get(manager.isValid)).toBe(true)
  expect(get(manager.errors)).toEqual({})

  manager.setData({ name: 'i', age: 2, married: true })
  expect(get(manager.isValid)).toBe(false)
  expect(get(manager.errors)).toEqual({
    name: ['err_string_min'],
    age: ['err_number_gte']
  })
})
