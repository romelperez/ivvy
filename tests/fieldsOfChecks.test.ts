/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { test, expect } from 'vitest'
import { get } from 'svelte/store'
import { type InferYrel, y } from 'yrel'
import { createIvvyManager } from '../'

test('Should set form elements initialData and setData data updates', () => {
  const schema = y.object({
    married: y.boolean(),
    pets: y.array(y.string()),
    profession: y.union([y.literal('programmer'), y.literal('designer')])
  })
  type Data = InferYrel<typeof schema>
  const manager = createIvvyManager<Data>({
    initialData: {
      married: true,
      pets: ['dog', 'fish'],
      profession: 'programmer'
    }
  })

  const formElement = document.createElement('form')
  formElement.innerHTML = `
    <input name="married" type="checkbox" />
    <input name="pets" value="cat" type="checkbox" />
    <input name="pets" value="dog" type="checkbox" />
    <input name="pets" value="fish" type="checkbox" />
    <input name="profession" value="programmer" type="radio" />
    <input name="profession" value="designer" type="radio" />
  `
  const fieldElementMarried = formElement.querySelector<HTMLInputElement>('[name=married]')!
  const fieldElementPetsCat = formElement.querySelector<HTMLInputElement>('[name=pets][value=cat]')!
  const fieldElementPetsDog = formElement.querySelector<HTMLInputElement>('[name=pets][value=dog]')!
  const fieldElementPetsFish =
    formElement.querySelector<HTMLInputElement>('[name=pets][value=fish]')!
  const fieldElementProfessionProgrammer = formElement.querySelector<HTMLInputElement>(
    '[name=profession][value=programmer]'
  )!
  const fieldElementProfessionDesigner = formElement.querySelector<HTMLInputElement>(
    '[name=profession][value=designer]'
  )!

  manager.useFieldElement(fieldElementMarried)
  manager.useFieldElement(fieldElementPetsCat)
  manager.useFieldElement(fieldElementPetsDog)
  manager.useFieldElement(fieldElementPetsFish)
  manager.useFieldElement(fieldElementProfessionProgrammer)
  manager.useFieldElement(fieldElementProfessionDesigner)

  expect(fieldElementMarried.checked).toBe(true)
  expect(fieldElementPetsCat.checked).toBe(false)
  expect(fieldElementPetsDog.checked).toBe(true)
  expect(fieldElementPetsFish.checked).toBe(true)
  expect(fieldElementProfessionProgrammer.checked).toBe(true)
  expect(fieldElementProfessionDesigner.checked).toBe(false)

  manager.setData({
    married: undefined,
    pets: undefined,
    profession: undefined
  })
  expect(fieldElementMarried.checked).toBe(false)
  expect(fieldElementPetsCat.checked).toBe(false)
  expect(fieldElementPetsDog.checked).toBe(false)
  expect(fieldElementPetsFish.checked).toBe(false)
  expect(fieldElementProfessionProgrammer.checked).toBe(false)
  expect(fieldElementProfessionDesigner.checked).toBe(false)

  manager.setData({
    married: false,
    pets: ['cat', 'fish'],
    profession: 'designer'
  })
  expect(fieldElementMarried.checked).toBe(false)
  expect(fieldElementPetsCat.checked).toBe(true)
  expect(fieldElementPetsDog.checked).toBe(false)
  expect(fieldElementPetsFish.checked).toBe(true)
  expect(fieldElementProfessionProgrammer.checked).toBe(false)
  expect(fieldElementProfessionDesigner.checked).toBe(true)

  manager.setData({
    married: null,
    pets: null,
    profession: null
  })
  expect(fieldElementMarried.checked).toBe(false)
  expect(fieldElementPetsCat.checked).toBe(false)
  expect(fieldElementPetsDog.checked).toBe(false)
  expect(fieldElementPetsFish.checked).toBe(false)
  expect(fieldElementProfessionProgrammer.checked).toBe(false)
  expect(fieldElementProfessionDesigner.checked).toBe(false)
})

test('Should set form elements update/touch events', () => {
  const schema = y.object({
    married: y.boolean(),
    pets: y.array(y.string()),
    profession: y.union([y.literal('programmer'), y.literal('designer')])
  })
  type Data = InferYrel<typeof schema>
  const manager = createIvvyManager<Data>({
    initialData: {
      married: true,
      pets: ['dog', 'fish'],
      profession: 'programmer'
    }
  })

  const formElement = document.createElement('form')
  formElement.innerHTML = `
    <input name="married" type="checkbox" />
    <input name="pets" value="cat" type="checkbox" />
    <input name="pets" value="dog" type="checkbox" />
    <input name="pets" value="fish" type="checkbox" />
    <input name="profession" value="programmer" type="radio" />
    <input name="profession" value="designer" type="radio" />
  `
  const fieldElementMarried = formElement.querySelector<HTMLInputElement>('[name=married]')!
  const fieldElementPetsCat = formElement.querySelector<HTMLInputElement>('[name=pets][value=cat]')!
  const fieldElementPetsDog = formElement.querySelector<HTMLInputElement>('[name=pets][value=dog]')!
  const fieldElementPetsFish =
    formElement.querySelector<HTMLInputElement>('[name=pets][value=fish]')!
  const fieldElementProfessionProgrammer = formElement.querySelector<HTMLInputElement>(
    '[name=profession][value=programmer]'
  )!
  const fieldElementProfessionDesigner = formElement.querySelector<HTMLInputElement>(
    '[name=profession][value=designer]'
  )!

  manager.useFieldElement(fieldElementMarried)
  manager.useFieldElement(fieldElementPetsCat)
  manager.useFieldElement(fieldElementPetsDog)
  manager.useFieldElement(fieldElementPetsFish)
  manager.useFieldElement(fieldElementProfessionProgrammer)
  manager.useFieldElement(fieldElementProfessionDesigner)

  fieldElementMarried.checked = false
  fieldElementMarried.dispatchEvent(new Event('change'))
  expect(get(manager.data)).toMatchObject({ married: false })
  expect(get(manager.isTouched)).toBe(true)
  expect(get(manager.touches)).toEqual({ married: true })

  fieldElementPetsDog.checked = false
  fieldElementPetsDog.dispatchEvent(new Event('change'))
  expect(get(manager.data)).toMatchObject({ pets: ['fish'] })
  expect(get(manager.isTouched)).toBe(true)
  expect(get(manager.touches)).toEqual({ married: true, pets: true })

  fieldElementPetsCat.checked = true
  fieldElementPetsCat.dispatchEvent(new Event('change'))
  expect(get(manager.data)).toMatchObject({ pets: ['fish', 'cat'] })
  expect(get(manager.isTouched)).toBe(true)
  expect(get(manager.touches)).toEqual({ married: true, pets: true })

  fieldElementProfessionDesigner.checked = true
  fieldElementProfessionDesigner.dispatchEvent(new Event('change'))
  expect(get(manager.data)).toMatchObject({ profession: 'designer' })
  expect(get(manager.isTouched)).toBe(true)
  expect(get(manager.touches)).toEqual({ married: true, pets: true, profession: true })
})
