/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { vi, test, expect } from 'vitest'
import { get } from 'svelte/store'
import { y, type InferYrel } from 'yrel'
import { createIvvyManager } from '../'

test('Should destroy form by reseting data and removing DOM event listeners', () => {
  const schema = y.object({
    name: y.string(),
    age: y.number(),
    married: y.boolean()
  })
  type Data = InferYrel<typeof schema>
  const onSubmit = vi.fn()
  const manager = createIvvyManager<Data>({
    initialData: {
      name: 'ivvy',
      age: 21,
      married: false
    },
    validators: schema,
    onSubmit
  })

  const formElement = document.createElement('form')
  formElement.innerHTML = `
    <input name="name" type="text" />
    <input name="age" type="number" />
    <input name="married" type="checkbox" />
    <button type="submit">submit</button>
  `
  const fieldElementName = formElement.querySelector<HTMLInputElement>('[name=name]')!
  const fieldElementAge = formElement.querySelector<HTMLInputElement>('[name=age]')!
  const fieldElementMarried = formElement.querySelector<HTMLInputElement>('[name=married]')!

  manager.useFormElement(formElement)
  manager.useFieldElement(fieldElementName)
  manager.useFieldElement(fieldElementAge)
  manager.useFieldElement(fieldElementMarried)

  expect(get(manager.isValid)).toBe(true)
  expect(get(manager.errors)).toEqual({})
  expect(get(manager.data)).toEqual({ name: 'ivvy', age: 21, married: false })
  expect(get(manager.isTouched)).toBe(false)
  expect(get(manager.touches)).toEqual({})

  fieldElementAge.value = 'x'
  fieldElementAge.dispatchEvent(new Event('change'))

  expect(get(manager.isValid)).toBe(false)
  expect(get(manager.errors)).toEqual({ age: ['err_number'] })
  expect(get(manager.data)).toEqual({ name: 'ivvy', age: NaN, married: false })
  expect(get(manager.isTouched)).toBe(true)
  expect(get(manager.touches)).toEqual({ age: true })

  fieldElementAge.value = '0'
  fieldElementAge.dispatchEvent(new Event('change'))
  formElement.dispatchEvent(new Event('submit'))

  expect(get(manager.isValid)).toBe(true)
  expect(onSubmit).toHaveBeenCalledTimes(1)

  manager.destroy()

  fieldElementAge.value = '10'
  fieldElementAge.dispatchEvent(new Event('change'))
  formElement.dispatchEvent(new Event('submit'))

  expect(get(manager.isValid)).toBe(true)
  expect(get(manager.errors)).toEqual({})
  expect(get(manager.data)).toEqual({ name: 'ivvy', age: 21, married: false })
  expect(get(manager.isTouched)).toBe(false)
  expect(get(manager.touches)).toEqual({})
  expect(onSubmit).toHaveBeenCalledTimes(1)
})
