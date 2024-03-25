/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { test, expect } from 'vitest'
import { get } from 'svelte/store'
import { type InferYrel, y } from 'yrel'
import { createIvvyManager } from '../'

test('Should throw error if field element name is not defined in form initialData', () => {
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

  const element1 = document.createElement('input')
  expect(() => {
    manager.useFieldElement(element1)
  }).toThrowError(
    'Ivvy was provided a form element with name "null" which is not defined in the initial form manager configuration.'
  )

  const element2 = document.createElement('textarea')
  element2.name = ''
  expect(() => {
    manager.useFieldElement(element2)
  }).toThrowError(
    'Ivvy was provided a form element with name "" which is not defined in the initial form manager configuration.'
  )

  const element3 = document.createElement('select')
  element3.name = 'xyz'
  expect(() => {
    manager.useFieldElement(element3)
  }).toThrowError(
    'Ivvy was provided a form element with name "xyz" which is not defined in the initial form manager configuration.'
  )
})

test('Should remove element event listeners if destroyed', () => {
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

  const formElement = document.createElement('form')
  formElement.innerHTML = `
    <input name="name" type="text" />
    <input name="age" type="number" />
    <textarea name="bio" />
  `
  const fieldElementName = formElement.querySelector<HTMLInputElement>('[name=name]')!
  const fieldElementAge = formElement.querySelector<HTMLInputElement>('[name=age]')!
  const fieldElementBio = formElement.querySelector<HTMLInputElement>('[name=bio]')!

  const hookName = manager.useFieldElement(fieldElementName)
  const hookAge = manager.useFieldElement(fieldElementAge)
  const hookBio = manager.useFieldElement(fieldElementBio)

  fieldElementName.value = 'iv'
  fieldElementName.dispatchEvent(new Event('change'))
  fieldElementAge.value = '123'
  fieldElementAge.dispatchEvent(new Event('change'))
  fieldElementBio.value = 'updated bio'
  fieldElementBio.dispatchEvent(new Event('change'))
  expect(get(manager.data)).toEqual({ name: 'iv', age: 123, bio: 'updated bio' })

  hookName.destroy()
  hookAge.destroy()
  hookBio.destroy()

  fieldElementName.value = 'IVVY'
  fieldElementName.dispatchEvent(new Event('change'))
  fieldElementAge.value = '456'
  fieldElementAge.dispatchEvent(new Event('change'))
  fieldElementBio.value = 'new bio'
  fieldElementBio.dispatchEvent(new Event('change'))
  expect(get(manager.data)).toEqual({ name: 'iv', age: 123, bio: 'updated bio' })
})
