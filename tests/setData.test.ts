/* eslint-disable @typescript-eslint/no-non-null-assertion */
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

test('Should support data updates on respective DOM elements', () => {
  type Data = {
    name: string
    age: number
    married: boolean
    pet: string
    bio: string
  }
  const manager = createIvvyManager<Data>({
    initialData: {
      name: 'ivvy',
      age: 21,
      married: false,
      pet: 'cat',
      bio: 'my bio'
    }
  })

  const formElement = document.createElement('form')
  formElement.innerHTML = `
    <input name="name" type="text" />
    <input name="age" type="number" />
    <input name="married" type="checkbox" />
    <select name="pet">
      <option value="cat">cat</option>
      <option value="dog">dog</option>
    </select>
    <textarea name="bio" />
  `
  const fieldElementName = formElement.querySelector<HTMLInputElement>('[name=name]')!
  const fieldElementAge = formElement.querySelector<HTMLInputElement>('[name=age]')!
  const fieldElementMarried = formElement.querySelector<HTMLInputElement>('[name=married]')!
  const fieldElementPet = formElement.querySelector<HTMLInputElement>('[name=pet]')!
  const fieldElementBio = formElement.querySelector<HTMLTextAreaElement>('[name=bio]')!

  manager.useFormElement(formElement)
  manager.useFieldElement(fieldElementName)
  manager.useFieldElement(fieldElementAge)
  manager.useFieldElement(fieldElementMarried)
  manager.useFieldElement(fieldElementPet)
  manager.useFieldElement(fieldElementBio)

  expect(get(manager.isValid)).toBe(true)
  expect(get(manager.errors)).toEqual({})
  expect(get(manager.data)).toEqual({
    name: 'ivvy',
    age: 21,
    married: false,
    pet: 'cat',
    bio: 'my bio'
  })

  expect(fieldElementName.value).toBe('ivvy')
  expect(fieldElementAge.value).toBe('21')
  expect(fieldElementMarried.checked).toBe(false)
  expect(fieldElementPet.value).toBe('cat')
  expect(fieldElementBio.value).toBe('my bio')

  manager.setData({ name: 'iv', age: 10, married: true, pet: 'dog', bio: 'updated bio' })

  expect(get(manager.isValid)).toBe(true)
  expect(get(manager.errors)).toEqual({})
  expect(get(manager.data)).toEqual({
    name: 'iv',
    age: 10,
    married: true,
    pet: 'dog',
    bio: 'updated bio'
  })

  expect(fieldElementName.value).toBe('iv')
  expect(fieldElementAge.value).toBe('10')
  expect(fieldElementMarried.checked).toBe(true)
  expect(fieldElementPet.value).toBe('dog')
  expect(fieldElementBio.value).toBe('updated bio')
})
