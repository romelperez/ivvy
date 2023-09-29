import { test, expect } from 'vitest'
import { get } from 'svelte/store'
import { type InferYrel, y } from 'yrel'
import { createIvvyManager } from '../'

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
      married: false
    },
    validators: {
      name: ({ name }) => name.length > 2 || ['err_string_min'],
      age: ({ age }) => age > 18 || ['err_number_gte'],
      married: ({ married }) => typeof married === 'boolean' || ['']
    }
  })
  expect(get(manager.isValid)).toBe(true)

  manager.data.set({ name: 'i', age: 2, married: true })
  expect(get(manager.isValid)).toBe(false)
  expect(get(manager.errors)).toEqual({
    name: ['err_string_min'],
    age: ['err_number_gte']
  })
})

test('Should accept inline-validators with translations', () => {
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
      name: ({ name }) => name.length > 2 || ['err_string_min'],
      age: ({ age }) => age > 18 || ['err_number_gte'],
      married: ({ married }) => typeof married === 'boolean' || ['']
    },
    locale: 'en',
    translations: {
      en: {
        err_number_gte: 'Number requires length.',
        err_string_min: 'String requires min length.'
      }
    }
  })
  expect(get(manager.isValid)).toBe(true)

  manager.data.set({ name: 'i', age: 2, married: true })
  expect(get(manager.isValid)).toBe(false)
  expect(get(manager.errors)).toEqual({
    name: ['String requires min length.'],
    age: ['Number requires length.']
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
    validators: schema.shape
  })
  expect(get(manager.isValid)).toBe(true)
  expect(get(manager.errors)).toEqual({})

  manager.data.set({ name: 'i', age: 2, married: true })
  expect(get(manager.isValid)).toBe(false)
  expect(get(manager.errors)).toEqual({
    name: ['err_string_min'],
    age: ['err_number_gte']
  })
})

test('Should accept yrel object schema as validators with translations', () => {
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
    validators: schema.shape,
    locale: 'en',
    translations: {
      en: {
        err_number_gte: 'Number requires gte {{gte}}.',
        err_string_min: 'String requires min length {{min}}.'
      }
    }
  })
  expect(get(manager.isValid)).toBe(true)
  expect(get(manager.errors)).toEqual({})

  manager.data.set({ name: 'i', age: 2, married: true })
  expect(get(manager.isValid)).toBe(false)
  expect(get(manager.errors)).toEqual({
    name: ['String requires min length 2.'],
    age: ['Number requires gte 18.']
  })
})
