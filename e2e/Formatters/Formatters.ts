import { type IvvyManager, createIvvyManager } from '../../build/esm'
import { type FormData, schema, translations } from '../__forms__/UserForm'

export const createFormManager = (): IvvyManager<FormData> =>
  createIvvyManager<FormData>({
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
      fullName: (value) => (value ? String(value).toUpperCase() : ''),
      age: (value) => (Number.isFinite(value) && value !== '' ? Number(value) : null)
    },
    validators: schema,
    translations
  })
