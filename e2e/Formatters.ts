import { type IvvyManager, createIvvyManager } from '../'
import { type FormData, schema, translations } from './UserForm'

export const createFormManager = (): IvvyManager<FormData> => createIvvyManager<FormData>({
  preventSubmit: 'always',
  initialData: {
    fullName: null,
    email: null,
    age: null,
    profession: null,
    bio: null,
    sex: null,
    is_married: null,
    favourite_pets: null
  },
  formatters: {
    fullName: (value) => value ? String(value).toUpperCase() : '',
    age: (value) => (isNaN(Number(value)) ? null : Number(value))
  },
  validators: schema.shape,
  locale: 'en',
  translations
})
