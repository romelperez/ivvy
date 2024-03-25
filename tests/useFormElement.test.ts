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

test('Should, on submit, call onSubmit if valid data, or ignore it and focus first field with error if invalid data', () => {
  const schema = y.object({ name: y.string(), age: y.number() })
  type Data = InferYrel<typeof schema>
  const onSubmit = vi.fn()
  const manager = createIvvyManager<Data>({
    initialData: { name: 'ivvy', age: 21 },
    validators: schema,
    onSubmit
  })

  const formElement = document.createElement('form')
  formElement.innerHTML = `
    <input name="name" />
    <input name="age" />
    <button type="submit">submit</button>
  `
  manager.useFormElement(formElement)

  const fieldElementName = formElement.querySelector<HTMLInputElement>('[name=name]')!
  const fieldElementAge = formElement.querySelector<HTMLInputElement>('[name=age]')!

  manager.useFieldElement(fieldElementName)
  manager.useFieldElement(fieldElementAge)

  const onSubmitEvent = new Event('submit')
  const spyFieldElementNameFocus = vi.spyOn(fieldElementName, 'focus')
  const spyFieldElementAgeFocus = vi.spyOn(fieldElementAge, 'focus')

  manager.setData({ age: '123' as any })
  expect(get(manager.isValid)).toBe(false)
  formElement.dispatchEvent(onSubmitEvent)
  expect(spyFieldElementNameFocus).toHaveBeenCalledTimes(0)
  expect(spyFieldElementAgeFocus).toHaveBeenCalledTimes(1)
  expect(onSubmit).toHaveBeenCalledTimes(0)

  manager.setData({ age: 2 })
  expect(get(manager.isValid)).toBe(true)
  formElement.dispatchEvent(onSubmitEvent)
  expect(spyFieldElementNameFocus).toHaveBeenCalledTimes(0)
  expect(spyFieldElementAgeFocus).toHaveBeenCalledTimes(1)
  expect(onSubmit).toHaveBeenCalledTimes(1)
})

test('Should submitEvent.preventDefault() onError by default or if configured on form submit when invalid data', () => {
  const createTest = (providePreventSubmitOnErrorConfig: boolean): void => {
    const schema = y.object({ name: y.string(), age: y.number() })
    type Data = InferYrel<typeof schema>
    const onSubmit = vi.fn()
    const manager = createIvvyManager<Data>({
      initialData: { name: 'ivvy', age: 21 },
      validators: schema,
      onSubmit,
      ...(providePreventSubmitOnErrorConfig ? { preventSubmit: 'onError' } : {})
    })

    const formElement = document.createElement('form')
    formElement.innerHTML = '<button type="submit">submit</button>'
    manager.useFormElement(formElement)

    const onSubmitEvent = new Event('submit')
    const spyPreventDefaultOnSubmit = vi.spyOn(onSubmitEvent, 'preventDefault')

    manager.setData({ age: '123' as any })
    expect(get(manager.isValid)).toBe(false)
    formElement.dispatchEvent(onSubmitEvent)
    expect(spyPreventDefaultOnSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledTimes(0)

    manager.setData({ age: 2 })
    expect(get(manager.isValid)).toBe(true)
    formElement.dispatchEvent(onSubmitEvent)
    expect(spyPreventDefaultOnSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  }

  createTest(true)
  createTest(false)
})

test('Should always submitEvent.preventDefault() if configured', () => {
  const schema = y.object({ name: y.string(), age: y.number() })
  type Data = InferYrel<typeof schema>
  const onSubmit = vi.fn()
  const manager = createIvvyManager<Data>({
    initialData: { name: 'ivvy', age: 21 },
    validators: schema,
    preventSubmit: 'always',
    onSubmit
  })

  const formElement = document.createElement('form')
  formElement.innerHTML = '<button type="submit">submit</button>'
  manager.useFormElement(formElement)

  const onSubmitEvent = new Event('submit')
  const spyPreventDefaultOnSubmit = vi.spyOn(onSubmitEvent, 'preventDefault')

  manager.setData({ age: '123' as any })
  expect(get(manager.isValid)).toBe(false)
  formElement.dispatchEvent(onSubmitEvent)
  expect(spyPreventDefaultOnSubmit).toHaveBeenCalledTimes(1)
  expect(onSubmit).toHaveBeenCalledTimes(0)

  manager.setData({ age: 2 })
  expect(get(manager.isValid)).toBe(true)
  formElement.dispatchEvent(onSubmitEvent)
  expect(spyPreventDefaultOnSubmit).toHaveBeenCalledTimes(2)
  expect(onSubmit).toHaveBeenCalledTimes(1)
})

test('Should never submitEvent.preventDefault() if configured', () => {
  const schema = y.object({ name: y.string(), age: y.number() })
  type Data = InferYrel<typeof schema>
  const onSubmit = vi.fn()
  const manager = createIvvyManager<Data>({
    initialData: { name: 'ivvy', age: 21 },
    validators: schema,
    preventSubmit: false,
    onSubmit
  })

  const formElement = document.createElement('form')
  formElement.innerHTML = '<button type="submit">submit</button>'
  manager.useFormElement(formElement)

  const onSubmitEvent = new Event('submit')
  const spyPreventDefaultOnSubmit = vi.spyOn(onSubmitEvent, 'preventDefault')

  manager.setData({ age: '123' as any })
  expect(get(manager.isValid)).toBe(false)
  formElement.dispatchEvent(onSubmitEvent)
  expect(spyPreventDefaultOnSubmit).toHaveBeenCalledTimes(0)
  expect(onSubmit).toHaveBeenCalledTimes(0)

  manager.setData({ age: 2 })
  expect(get(manager.isValid)).toBe(true)
  formElement.dispatchEvent(onSubmitEvent)
  expect(spyPreventDefaultOnSubmit).toHaveBeenCalledTimes(0)
  expect(onSubmit).toHaveBeenCalledTimes(1)
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
