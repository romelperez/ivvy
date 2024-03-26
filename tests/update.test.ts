/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { test, expect } from 'vitest'
import { get } from 'svelte/store'
import { y } from 'yrel'
import { createIvvyManager } from '../'

test('Should update validators and revalidate data', () => {
  type Data = {
    name: string
    age: number
  }
  const manager = createIvvyManager<Data>({
    initialData: {
      name: 'ivvy',
      age: 21
    },
    validators: y.object({
      name: y.string(),
      age: y.number()
    })
  })
  expect(get(manager.isValid)).toBe(true)
  expect(get(manager.errors)).toEqual({})

  manager.update({
    validators: y.object({
      name: y.string(),
      age: y.number().gt(100)
    })
  })
  expect(get(manager.isValid)).toBe(false)
  expect(get(manager.errors)).toEqual({
    age: ['err_number_gt']
  })
})

test('Should update language and translations', () => {
  type Data = {
    name: string
    age: number
  }
  const manager = createIvvyManager<Data>({
    initialData: {
      name: 'ivvy',
      age: 21
    },
    validators: y.object({
      name: y.string(),
      age: y.number().gt(100)
    }),
    language: 'en',
    translations: {
      en: {
        err_number_gt: 'Number gt.'
      }
    }
  })
  expect(get(manager.isValid)).toBe(false)
  expect(get(manager.errors)).toEqual({
    age: ['Number gt.']
  })

  manager.update({
    language: 'es',
    translations: {
      en: {
        err_number_gt: 'Number gt.'
      },
      es: {
        err_number_gt: 'Número gt.'
      }
    }
  })
  expect(get(manager.isValid)).toBe(false)
  expect(get(manager.errors)).toEqual({
    age: ['Número gt.']
  })
})

test.todo('Should update formatters')

test.todo('Should update preventSubmit')

test.todo('Should update cleanInputFileValue')
