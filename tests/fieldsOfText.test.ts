/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { test, expect } from 'vitest'
import { get } from 'svelte/store'
import { type InferYrel, y } from 'yrel'
import { createIvvyManager } from '../'

test('Should set form elements initialData and setData data updates', () => {
  const schema = y.object({
    name: y.string(),
    birthdate: y.string().date(),
    age: y.number(),
    passcode: y.string(),
    website: y.string(),
    bio: y.string()
  })
  type Data = InferYrel<typeof schema>
  const manager = createIvvyManager<Data>({
    initialData: {
      name: 'ivvy',
      birthdate: '2024-01-01',
      age: 21,
      passcode: '123',
      website: 'https://x.com',
      bio: 'my bio'
    }
  })

  const formElement = document.createElement('form')
  formElement.innerHTML = `
    <input name="name" type="text" />
    <input name="birthdate" type="date" />
    <input name="age" type="number" />
    <input name="passcode" type="password" />
    <input name="website" type="url" />
    <textarea name="bio" />
  `
  const fieldElementName = formElement.querySelector<HTMLInputElement>('[name=name]')!
  const fieldElementBirthdate = formElement.querySelector<HTMLInputElement>('[name=birthdate]')!
  const fieldElementAge = formElement.querySelector<HTMLInputElement>('[name=age]')!
  const fieldElementPasscode = formElement.querySelector<HTMLInputElement>('[name=passcode]')!
  const fieldElementWebsite = formElement.querySelector<HTMLInputElement>('[name=website]')!
  const fieldElementBio = formElement.querySelector<HTMLInputElement>('[name=bio]')!

  manager.useFieldElement(fieldElementName)
  manager.useFieldElement(fieldElementBirthdate)
  manager.useFieldElement(fieldElementAge)
  manager.useFieldElement(fieldElementPasscode)
  manager.useFieldElement(fieldElementWebsite)
  manager.useFieldElement(fieldElementBio)

  expect(fieldElementName.value).toBe('ivvy')
  expect(fieldElementBirthdate.value).toBe('2024-01-01')
  expect(fieldElementAge.value).toBe('21')
  expect(fieldElementPasscode.value).toBe('123')
  expect(fieldElementWebsite.value).toBe('https://x.com')
  expect(fieldElementBio.value).toBe('my bio')

  manager.setData({
    name: 'IV',
    birthdate: '2000-01-01',
    age: 10,
    passcode: 'abc',
    website: 'https://y.com',
    bio: 'new bio'
  })

  expect(fieldElementName.value).toBe('IV')
  expect(fieldElementBirthdate.value).toBe('2000-01-01')
  expect(fieldElementAge.value).toBe('10')
  expect(fieldElementPasscode.value).toBe('abc')
  expect(fieldElementWebsite.value).toBe('https://y.com')
  expect(fieldElementBio.value).toBe('new bio')

  const fieldNames = ['name', 'birthdate', 'age', 'passcode', 'website', 'bio']
  for (const fieldName of fieldNames) {
    const fieldElement = formElement.querySelector<HTMLInputElement>(`[name=${fieldName}]`)!
    const randomValue =
      fieldName === 'birthdate' ? '2000-12-12' : fieldName === 'age' ? '123' : 'xyz'

    manager.setData({ [fieldName]: '' })
    expect(fieldElement.value).toBe('')

    manager.setData({ [fieldName]: randomValue })
    expect(fieldElement.value).toBe(randomValue)

    manager.setData({ [fieldName]: undefined })
    expect(fieldElement.value).toBe('')

    manager.setData({ [fieldName]: randomValue })
    expect(fieldElement.value).toBe(randomValue)

    manager.setData({ [fieldName]: null })
    expect(fieldElement.value).toBe('')
  }
})

test('Should set form elements update events', () => {
  const schema = y.object({
    name: y.string(),
    birthdate: y.string().date(),
    age: y.number(),
    passcode: y.string(),
    website: y.string(),
    bio: y.string()
  })
  type Data = InferYrel<typeof schema>
  const manager = createIvvyManager<Data>({
    initialData: {
      name: 'ivvy',
      birthdate: '2024-01-01',
      age: 21,
      passcode: '123',
      website: 'https://x.com',
      bio: 'my bio'
    }
  })

  const formElement = document.createElement('form')
  formElement.innerHTML = `
    <input name="name" type="text" />
    <input name="birthdate" type="date" />
    <input name="age" type="number" />
    <input name="passcode" type="password" />
    <input name="website" type="url" />
    <textarea name="bio" />
  `
  const fieldElementName = formElement.querySelector<HTMLInputElement>('[name=name]')!
  const fieldElementBirthdate = formElement.querySelector<HTMLInputElement>('[name=birthdate]')!
  const fieldElementAge = formElement.querySelector<HTMLInputElement>('[name=age]')!
  const fieldElementPasscode = formElement.querySelector<HTMLInputElement>('[name=passcode]')!
  const fieldElementWebsite = formElement.querySelector<HTMLInputElement>('[name=website]')!
  const fieldElementBio = formElement.querySelector<HTMLInputElement>('[name=bio]')!

  manager.useFieldElement(fieldElementName)
  manager.useFieldElement(fieldElementBirthdate)
  manager.useFieldElement(fieldElementAge)
  manager.useFieldElement(fieldElementPasscode)
  manager.useFieldElement(fieldElementWebsite)
  manager.useFieldElement(fieldElementBio)

  const fieldNames = ['name', 'birthdate', 'age', 'passcode', 'website', 'bio']
  for (const fieldName of fieldNames) {
    const fieldElement = formElement.querySelector<HTMLInputElement>(`[name=${fieldName}]`)!

    const randomValue1 =
      fieldName === 'birthdate' ? '2000-12-12' : fieldName === 'age' ? 123 : 'xyz'
    fieldElement.value = String(randomValue1)
    fieldElement.dispatchEvent(new Event('input'))
    expect((get(manager.data) as any)[fieldName]).toBe(randomValue1)

    const randomValue2 =
      fieldName === 'birthdate' ? '2050-12-12' : fieldName === 'age' ? 345 : 'qwe'
    fieldElement.value = String(randomValue2)
    fieldElement.dispatchEvent(new Event('change'))
    expect((get(manager.data) as any)[fieldName]).toBe(randomValue2)
  }
})

test('Should set form elements touch events', () => {
  const schema = y.object({
    name: y.string(),
    birthdate: y.string().date(),
    age: y.number(),
    passcode: y.string(),
    website: y.string(),
    bio: y.string()
  })
  type Data = InferYrel<typeof schema>
  const manager = createIvvyManager<Data>({
    initialData: {
      name: 'ivvy',
      birthdate: '2024-01-01',
      age: 21,
      passcode: '123',
      website: 'https://x.com',
      bio: 'my bio'
    }
  })

  const formElement = document.createElement('form')
  formElement.innerHTML = `
    <input name="name" type="text" />
    <input name="birthdate" type="date" />
    <input name="age" type="number" />
    <input name="passcode" type="password" />
    <input name="website" type="url" />
    <textarea name="bio" />
  `
  const fieldElementName = formElement.querySelector<HTMLInputElement>('[name=name]')!
  const fieldElementBirthdate = formElement.querySelector<HTMLInputElement>('[name=birthdate]')!
  const fieldElementAge = formElement.querySelector<HTMLInputElement>('[name=age]')!
  const fieldElementPasscode = formElement.querySelector<HTMLInputElement>('[name=passcode]')!
  const fieldElementWebsite = formElement.querySelector<HTMLInputElement>('[name=website]')!
  const fieldElementBio = formElement.querySelector<HTMLInputElement>('[name=bio]')!

  manager.useFieldElement(fieldElementName)
  manager.useFieldElement(fieldElementBirthdate)
  manager.useFieldElement(fieldElementAge)
  manager.useFieldElement(fieldElementPasscode)
  manager.useFieldElement(fieldElementWebsite)
  manager.useFieldElement(fieldElementBio)

  const fieldNames = ['name', 'birthdate', 'age', 'passcode', 'website', 'bio']
  const fieldNamesTouched: string[] = []
  for (const fieldName of fieldNames) {
    const fieldElement = formElement.querySelector<HTMLInputElement>(`[name=${fieldName}]`)!

    const randomValue = fieldName === 'birthdate' ? '2000-12-12' : fieldName === 'age' ? 123 : 'xyz'
    fieldElement.value = String(randomValue)
    fieldElement.dispatchEvent(new Event('change'))

    // Get the object of touches only with the fields which have been actually touched.
    // All other field names should not be present in the object.
    fieldNamesTouched.push(fieldName)
    const newFieldsTouches = fieldNamesTouched.reduce(
      (total, item) => ({ ...total, [item]: true }),
      {}
    )

    expect(get(manager.touches)).toEqual(newFieldsTouches)
    expect(get(manager.isTouched)).toBe(true)
  }
})
