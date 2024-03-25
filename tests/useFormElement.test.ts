/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { vi, test, expect } from 'vitest'
import { get } from 'svelte/store'
import { type InferYrel, y } from 'yrel'
import { createIvvyManager } from '../'

test('Should throw error if element is not a form', () => {
  const schema = y.object({
    name: y.string(),
    age: y.number(),
    bio: y.string()
  })
  type Data = InferYrel<typeof schema>
  const manager = createIvvyManager<Data>({
    initialData: {
      name: 'ivvy',
      age: 21,
      bio: 'mybio'
    }
  })

  expect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    manager.useFormElement(document.createElement('input') as any)
  }).toThrowError('Ivvy manager "useFormElement" was not provided a valid <form/> element.')

  // Valid form element.
  manager.useFormElement(document.createElement('form'))
})

test('Should throw error if provided multiple forms', () => {
  const schema = y.object({
    name: y.string(),
    age: y.number(),
    bio: y.string()
  })
  type Data = InferYrel<typeof schema>
  const manager = createIvvyManager<Data>({
    initialData: {
      name: 'ivvy',
      age: 21,
      bio: 'mybio'
    }
  })

  manager.useFormElement(document.createElement('form'))

  expect(() => {
    manager.useFormElement(document.createElement('form'))
  }).toThrowError('Ivvy manager already has an existing form configured')
})

test('Should remove element event listeners if destroyed', () => {
  const schema = y.object({
    name: y.string(),
    age: y.number(),
    bio: y.string()
  })
  type Data = InferYrel<typeof schema>
  const onSubmit = vi.fn()
  const manager = createIvvyManager<Data>({
    initialData: {
      name: 'ivvy',
      age: 21,
      bio: 'mybio'
    },
    onSubmit
  })

  const formElement = document.createElement('form')
  formElement.innerHTML = '<button type="submit">submit</button>'
  const hook = manager.useFormElement(formElement)

  formElement.dispatchEvent(new Event('submit'))
  expect(onSubmit).toHaveBeenCalledTimes(1)

  hook.destroy()

  formElement.dispatchEvent(new Event('submit'))
  expect(onSubmit).toHaveBeenCalledTimes(1)
})
