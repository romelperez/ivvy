import { test } from 'vitest'
import { y } from 'yrel'
import { createIvvyManager } from '../'

test('Should require initialData values or nulls/undefineds', () => {
  type Data = {
    name: string
    age: number
    married: boolean
  }
  createIvvyManager<Data>({
    initialData: { name: null, age: null, married: null },
    validators: { name: y.string(), age: y.number(), married: y.boolean() }
  })
  createIvvyManager<Data>({
    initialData: { name: undefined, age: undefined, married: undefined },
    validators: { name: y.string(), age: y.number(), married: y.boolean() }
  })
  createIvvyManager<Data>({
    // @ts-expect-error test
    initialData: { name: 21, age: 'yrel', married: false },
    validators: { name: y.string(), age: y.number(), married: y.boolean() }
  })
  createIvvyManager<Data>({
    initialData: { name: 'ivvy', age: 21, married: false },
    validators: { name: y.string(), age: y.number(), married: y.boolean() }
  })
})

test('Should require all data props on initialData', () => {
  type Data = {
    name: string
    age: number
    married: boolean
  }
  createIvvyManager<Data>({
    // @ts-expect-error test
    initialData: { name: 'ivvy', married: false },
    validators: { name: y.string(), age: y.number(), married: y.boolean() }
  })
  createIvvyManager<Data>({
    // @ts-expect-error test
    initialData: { name: 'ivvy', age: 21 },
    validators: { name: y.string(), age: y.number(), married: y.boolean() }
  })
  createIvvyManager<Data>({
    initialData: { name: 'ivvy', age: 21, married: false },
    validators: { name: y.string(), age: y.number(), married: y.boolean() }
  })
})
