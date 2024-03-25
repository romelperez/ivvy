/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
  expect(get(manager.data)).toEqual({ name: 'ivvy', age: 21, married: false })

  const formElement = document.createElement('form')
  formElement.innerHTML = `
    <input name="name" type="text" />
    <input name="age" type="number" />
    <input name="married" type="checkbox" />
  `
  const fieldElementName = formElement.querySelector<HTMLInputElement>('[name=name]')!
  const fieldElementAge = formElement.querySelector<HTMLInputElement>('[name=age]')!
  const fieldElementMarried = formElement.querySelector<HTMLInputElement>('[name=married]')!

  manager.useFieldElement(fieldElementName)
  manager.useFieldElement(fieldElementAge)
  manager.useFieldElement(fieldElementMarried)

  fieldElementName.value = 'iv'
  fieldElementName.dispatchEvent(new Event('change'))
  expect(get(manager.data)).toEqual({ name: 'IV', age: 21, married: false })

  fieldElementAge.value = '30'
  fieldElementAge.dispatchEvent(new Event('change'))
  expect(get(manager.data)).toEqual({ name: 'IV', age: 60, married: false })
})
