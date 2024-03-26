import { test, expect } from 'vitest'
import { get } from 'svelte/store'
import { type InferYrel, y } from 'yrel'
import { createIvvyManager, type IvvyManagerPropsTranslations } from '../'

test('Should accept partial Yrel error translations and report data errors if invalid', () => {
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
    validators: {
      name: y.string(),
      age: y.number().gt(10),
      married: y.boolean()
    },
    translations: {
      en: {
        err_number: 'A number is required.',
        err_number_gt: 'At least {{gt}} is required.',
        err_string: 'A string is required.'
      }
    }
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  manager.setData({
    name: 1,
    age: 4,
    married: 'false'
  } as any)
  expect(get(manager.isValid)).toBe(false)
  expect(get(manager.errors)).toEqual({
    name: ['A string is required.'],
    age: ['At least 10 is required.'],
    married: ['err_boolean'] // Unmapped error code.
  })
})

test('Should accept custom error messages in translations and report data errors if invalid', () => {
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
    validators: {
      name: () => ['my_error_name'],
      age: y.number().validate((v) => v >= 10 || [['err_custom', 'my_error_age', { atLeast: 10 }]]),
      married: () => ['my_error_married']
    },
    translations: {
      en: {
        my_error_age: 'The age must be at least {{atLeast}} in value.',
        my_error_married: 'Requires to be married.'
      }
    }
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  manager.setData({
    name: 1,
    age: 4,
    married: ''
  } as any)
  expect(get(manager.isValid)).toBe(false)
  expect(get(manager.errors)).toEqual({
    name: ['my_error_name'],
    age: ['The age must be at least 10 in value.'],
    married: ['Requires to be married.']
  })
})

test('Should accept custom language and translations', () => {
  const schema = y.object({
    name: y.string(),
    age: y.number()
  })
  type Data = InferYrel<typeof schema>
  type Languages = 'english' | 'spanish' | 'french'
  type LanguagesDefault = 'spanish'
  const translations: IvvyManagerPropsTranslations<Languages, LanguagesDefault> = {
    english: {
      err_number: 'Number required.',
      err_string: 'String required.'
    },
    spanish: {
      err_number: 'Número requerido.',
      err_string: 'Texto requerido.'
    },
    french: {
      err_number: 'Numéro requis.',
      err_string: 'Texte requis.'
    }
  }
  const manager = createIvvyManager<Data, Languages, LanguagesDefault>({
    initialData: { name: 'ivvy', age: 21 },
    validators: schema,
    language: 'french',
    translations
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  manager.setData({ name: 2, age: '10' } as any)
  expect(get(manager.isValid)).toBe(false)
  expect(get(manager.errors)).toEqual({
    name: ['Texte requis.'],
    age: ['Numéro requis.']
  })
})
