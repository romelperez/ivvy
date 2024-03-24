import { get } from 'svelte/store'
import { type YrelErrorTranslations, type YrelSchema, isYrel, validateYrel } from 'yrel'
import { type UktiLanguages, createUktiTranslator } from 'ukti'

import type {
  IvvyManagerFieldsErrors,
  IvvyManagerPropsInternal,
  IvvyManagerState
} from '../types.js'

const createFormValidator = <Data extends Record<string, unknown>>(
  props: IvvyManagerPropsInternal<Data>,
  state: IvvyManagerState<Data>
): (() => void) => {
  const createMapErrorMessage = (): ((msg: string, vars?: unknown) => string) => {
    const { language, translations } = props

    if (translations) {
      if (translations[language] === null || typeof translations[language] !== 'object') {
        throw new Error('Ivvy requires translation content for the provided language to use.')
      }

      const translator = createUktiTranslator<YrelErrorTranslations>({
        languageDefault: language as 'en',
        translations: translations as Record<
          UktiLanguages,
          Record<keyof YrelErrorTranslations, string>
        >
      })

      const translate = translator(language)

      return (msg, vars) => {
        const translation = (translate[msg as keyof YrelErrorTranslations] as any)(vars as any)
        return translation || msg
      }
    }

    return (msg) => msg
  }

  const mapErrorMessage = createMapErrorMessage()

  return (): void => {
    interface FieldValidation {
      name: keyof Data
      isValid: boolean
      errors: string[]
    }

    const { validators } = props

    if (!validators) {
      state.isValid.set(true)
      state.errors.set(Object.freeze({}))
      return
    }

    const data = get(state.data)
    const validatorsKeys = Object.keys(validators) as Array<keyof Data>

    const fieldsValidations: FieldValidation[] = validatorsKeys
      .map((validatorKey) => {
        const fieldData = data[validatorKey]
        const getFieldValidator = validators[validatorKey]
        const fieldValidator =
          typeof getFieldValidator === 'function' ? getFieldValidator(data) : getFieldValidator

        // It is valid.

        if (fieldValidator === true) {
          return [{ name: validatorKey, isValid: true, errors: [] }]
        }

        // A list of error messages.

        if (Array.isArray(fieldValidator)) {
          if (!fieldValidator.length) {
            throw new Error(
              'Ivvy form manager validators must be of type "YrelSchema | (data => true | [string, ...string[]]) | (data => YrelSchema)". Invalid empty array was provided.'
            )
          }

          const errors = fieldValidator.map((msg) => mapErrorMessage(msg))
          return [{ name: validatorKey, isValid: false, errors }]
        }

        // Otherwise, it is a Yrel schema.

        if (!isYrel(fieldValidator as YrelSchema)) {
          throw new Error(
            'Ivvy form manager validators must be of type "YrelSchema | (data => true | [string, ...string[]]) | (data => YrelSchema)".'
          )
        }

        const schemaValidation = validateYrel(fieldValidator as YrelSchema, fieldData, {
          rootKey: validatorKey as string
        })

        if (schemaValidation.isValid) {
          return [{ name: validatorKey, isValid: true, errors: [] }]
        }

        const fieldValidations = schemaValidation.issues
          .map((issue) => {
            const errors: string[] = issue.errors.map((err) => {
              if (err[0] === 'err_custom') {
                const [, code, vars] = err
                return mapErrorMessage(code, vars)
              }
              const [code, vars] = err
              return mapErrorMessage(code, vars)
            })
            return { key: issue.key, errors }
          })
          .map(({ key, errors }) => {
            if (key === validatorKey) {
              return { name: key, isValid: schemaValidation.isValid, errors }
            }
            return { name: key, isValid: !!errors.length, errors }
          })

        return fieldValidations
      })
      .flat()

    const areAllFieldsValid = fieldsValidations.every((validation) => validation.isValid)

    state.isValid.set(areAllFieldsValid)

    if (!areAllFieldsValid) {
      const newErrorsValue = fieldsValidations
        .filter((validation) => !validation.isValid)
        .map(({ name, errors }) => ({ [name]: errors }))
        .reduce((total, item) => ({ ...total, ...item }), {})

      state.errors.set(Object.freeze(newErrorsValue) as IvvyManagerFieldsErrors<Data>)
    } else {
      state.errors.set(Object.freeze({}))
    }
  }
}

export { createFormValidator }
