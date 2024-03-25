/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { test, expect } from 'vitest'
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
