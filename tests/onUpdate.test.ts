/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { vi, test, expect } from 'vitest'
import { y, type InferYrel } from 'yrel'
import { createIvvyManager } from '../'

test('Should call onUpdate when data updates', () => {
  const schema = y.object({
    name: y.string(),
    age: y.number(),
    married: y.boolean()
  })
  type Data = InferYrel<typeof schema>
  const onUpdate = vi.fn()
  const manager = createIvvyManager<Data>({
    initialData: { name: 'ivvy', age: 21, married: false },
    validators: schema,
    onUpdate
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

  fieldElementAge.value = '10'
  fieldElementAge.dispatchEvent(new Event('change'))
  expect(onUpdate).toHaveBeenCalledTimes(1)
  expect(onUpdate).toHaveBeenCalledWith({ name: 'ivvy', age: 10, married: false })

  fieldElementMarried.checked = true
  fieldElementMarried.dispatchEvent(new Event('change'))
  expect(onUpdate).toHaveBeenCalledTimes(2)
  expect(onUpdate).toHaveBeenCalledWith({ name: 'ivvy', age: 10, married: true })
})
