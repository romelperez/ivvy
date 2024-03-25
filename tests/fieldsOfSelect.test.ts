/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { test, expect } from 'vitest'
import { get } from 'svelte/store'
import { type InferYrel, y } from 'yrel'
import { createIvvyManager } from '../'

test('Should set form elements initialData and setData data updates', () => {
  const schema = y.object({
    code: y.union([y.literal('a'), y.literal('b'), y.literal('c')]),
    pets: y.array(y.string())
  })
  type Data = InferYrel<typeof schema>
  const manager = createIvvyManager<Data>({
    initialData: { code: 'b', pets: ['cat'] }
  })

  const formElement = document.createElement('form')
  formElement.innerHTML = `
    <select name="code">
      <option value="a">a</option>
      <option value="b">b</option>
      <option value="c">c</option>
    </select>
    <select name="pets" multiple>
      <option value="dog">dog</option>
      <option value="cat">cat</option>
      <option value="cow">cow</option>
    </select>
  `
  const fieldElementCode = formElement.querySelector<HTMLInputElement>('[name=code]')!
  const fieldElementPets = formElement.querySelector<HTMLInputElement>('[name=pets]')!
  const elementsPetsOptions = Array.from(fieldElementPets.querySelectorAll('option'))
  manager.useFieldElement(fieldElementCode)
  manager.useFieldElement(fieldElementPets)

  expect(fieldElementCode.value).toBe('b')
  expect(elementsPetsOptions.filter((v) => v.selected).map((v) => v.value)).toEqual(['cat'])

  manager.setData({ code: '' as any, pets: [] })
  expect(fieldElementCode.value).toBe('')
  expect(elementsPetsOptions.filter((v) => v.selected).map((v) => v.value)).toEqual([])

  manager.setData({ code: 'c', pets: ['dog', 'cow'] })
  expect(fieldElementCode.value).toBe('c')
  expect(elementsPetsOptions.filter((v) => v.selected).map((v) => v.value)).toEqual(['dog', 'cow'])

  manager.setData({ code: undefined, pets: undefined })
  expect(fieldElementCode.value).toBe('')
  expect(elementsPetsOptions.filter((v) => v.selected).map((v) => v.value)).toEqual([])

  manager.setData({ code: 'a', pets: ['cat', 'dog'] })
  expect(fieldElementCode.value).toBe('a')
  expect(elementsPetsOptions.filter((v) => v.selected).map((v) => v.value)).toEqual(['dog', 'cat'])

  manager.setData({ code: null, pets: null })
  expect(fieldElementCode.value).toBe('')
  expect(elementsPetsOptions.filter((v) => v.selected).map((v) => v.value)).toEqual([])
})

test('Should set form elements update/touch events', () => {
  const schema = y.object({
    code: y.union([y.literal('a'), y.literal('b'), y.literal('c')]),
    pets: y.array(y.string())
  })
  type Data = InferYrel<typeof schema>
  const manager = createIvvyManager<Data>({
    initialData: { code: 'b', pets: ['cat'] }
  })

  const formElement = document.createElement('form')
  formElement.innerHTML = `
    <select name="code">
      <option value="a">a</option>
      <option value="b">b</option>
      <option value="c">c</option>
    </select>
    <select name="pets" multiple>
      <option value="dog">dog</option>
      <option value="cat">cat</option>
      <option value="cow">cow</option>
    </select>
  `
  const fieldElementCode = formElement.querySelector<HTMLInputElement>('[name=code]')!
  const fieldElementPets = formElement.querySelector<HTMLInputElement>('[name=pets]')!
  const elementsPetsOptions = Array.from(fieldElementPets.querySelectorAll('option'))
  manager.useFieldElement(fieldElementCode)
  manager.useFieldElement(fieldElementPets)

  fieldElementCode.value = 'c'
  fieldElementCode.dispatchEvent(new Event('change'))
  expect(get(manager.data)).toEqual({ code: 'c', pets: ['cat'] })
  expect(get(manager.isTouched)).toBe(true)
  expect(get(manager.touches)).toEqual({ code: true })

  elementsPetsOptions[0] && (elementsPetsOptions[0].selected = true)
  elementsPetsOptions[1] && (elementsPetsOptions[1].selected = false)
  elementsPetsOptions[2] && (elementsPetsOptions[2].selected = true)
  fieldElementPets.dispatchEvent(new Event('change'))
  expect(get(manager.data)).toEqual({ code: 'c', pets: ['dog', 'cow'] })
  expect(get(manager.isTouched)).toBe(true)
  expect(get(manager.touches)).toEqual({ code: true, pets: true })
})
