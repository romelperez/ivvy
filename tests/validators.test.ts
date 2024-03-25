import { test, expect } from 'vitest'
import { get } from 'svelte/store'
import { type InferYrel, y, reportYrel } from 'yrel'
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
  const schema = y
    .object({
      name: y.string().min(2).max(10),
      age: y
        .number()
        .gte(18)
        .lte(100)
        .transform((value) => value + 10),
      married: y.boolean().defaultsTo(false)
    })
    .validate(
      (value) =>
        value.age === 31 ||
        reportYrel({
          children: [{ key: 'age', errors: [['err_custom', 'invalid_age']] }]
        })
    )
  type Data = InferYrel<typeof schema>
  const manager = createIvvyManager<Data>({
    initialData: {
      name: 'ivvy',
      age: 21,
      married: undefined
    },
    validators: schema
  })
  expect(get(manager.isValid)).toBe(true)
  expect(get(manager.errors)).toEqual({})
  expect(get(manager.data)).toEqual({
    name: 'ivvy',
    age: 31,
    married: false
  })

  manager.setData({ name: 'i', age: 2 })
  expect(get(manager.isValid)).toBe(false)
  expect(get(manager.errors)).toEqual({
    name: ['err_string_min'],
    age: ['err_number_gte', 'invalid_age']
  })
  expect(get(manager.data)).toEqual({
    name: 'i',
    age: 2, // Yrel schema transform was not applied since value is invalid.
    married: false // Value was not updated.
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
      married: undefined
    },
    validators: {
      name: y.string().min(2).max(10),
      age: y
        .number()
        .gte(18)
        .lte(100)
        .transform((value) => value + 10),
      married: y.boolean().defaultsTo(false)
    }
  })
  expect(get(manager.isValid)).toBe(true)
  expect(get(manager.errors)).toEqual({})
  expect(get(manager.data)).toEqual({
    name: 'ivvy',
    age: 31,
    married: false
  })

  manager.setData({ name: 'i', age: 2, married: true })
  expect(get(manager.isValid)).toBe(false)
  expect(get(manager.errors)).toEqual({
    name: ['err_string_min'],
    age: ['err_number_gte']
  })
  expect(get(manager.data)).toEqual({
    name: 'i',
    age: 2, // Yrel schema transform was not applied since value is invalid.
    married: true
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
      married: undefined
    },
    validators: {
      name: () => y.string().min(2).max(10),
      age: () =>
        y
          .number()
          .gte(18)
          .lte(100)
          .transform((value) => value + 10),
      married: () => y.boolean().defaultsTo(false)
    }
  })
  expect(get(manager.isValid)).toBe(true)
  expect(get(manager.errors)).toEqual({})
  expect(get(manager.data)).toEqual({
    name: 'ivvy',
    age: 31,
    married: false
  })

  manager.setData({ name: 'i', age: 2, married: true })
  expect(get(manager.isValid)).toBe(false)
  expect(get(manager.errors)).toEqual({
    name: ['err_string_min'],
    age: ['err_number_gte']
  })
  expect(get(manager.data)).toEqual({
    name: 'i',
    age: 2, // Yrel schema transform was not applied since value is invalid.
    married: true
  })
})
