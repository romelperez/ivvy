import { type IvvyManager, createIvvyManager } from '../../'
import { type FormData, schema, translations } from '../__forms__/UserForm'

export const createFormManager = (): IvvyManager<FormData> =>
  createIvvyManager<FormData>({
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
      age: (value) => (Number.isFinite(value) && value !== '' ? Number(value) : null)
    },
    validators: schema,
    translations
  })
