import { type IvvyManager, createIvvyManager } from '../'
import { type Schema, schema, translations } from './UserForm'

export const createFormManager = (): IvvyManager<Schema> => createIvvyManager<Schema>({
  preventSubmit: 'always',
  initialData: {
    fullName: 'Ivvy',
    email: 'ivvy@example',
    age: 10,
    profession: 'musician',
    bio: 'A basic description...',
    sex: 'female',
    is_married: true,
    favourite_pets: ['cats']
  },
  formatters: {
    age: (value) => (isNaN(Number(value)) ? null : Number(value))
  },
  validators: schema.shape,
  locale: 'en',
  translations
})
