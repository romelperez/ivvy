import { get } from 'svelte/store'
import { type YrelErrorTranslations, isYrel, validateYrel } from 'yrel'

import type { IvvyLocales, IvvyManagerFieldsErrors, IvvyManagerProps, IvvyManagerState } from '../types'
import { IVVY_LOCALE_DEFAULT } from '../constants'
import { createIvvyTranslator } from '../createIvvyTranslator'

const createFormValidator = <Data extends Record<string, unknown>>(
  props: IvvyManagerProps<Data>,
  state: IvvyManagerState<Data>
): (() => void) => {
  const { locale = IVVY_LOCALE_DEFAULT, translations, validators } = props

  type MapErrorMessage = (msg: string, vars?: unknown) => string

  interface FieldValidation {
    name: keyof Data
    isValid: boolean
    errors: string[]
  }

  const createMapErrorMessage = (): MapErrorMessage => {
    if (locale && translations) {
      const translate = createIvvyTranslator<YrelErrorTranslations>({
        locale,
        translations: translations as Record<IvvyLocales, Record<keyof YrelErrorTranslations, string>>
      })

      return (msg, vars) => {
        const translation = translate(msg as keyof YrelErrorTranslations, vars as any)
        return translation || msg
      }
    }

    return (msg) => msg
  }

  const mapErrorMessage = createMapErrorMessage()

  return (): void => {
    const data = get(state.data)
    const validatorsKeys = Object.keys(validators) as Array<keyof Data>

    const fieldsValidations: FieldValidation[] = validatorsKeys
      .map((validatorKey) => {
        const fieldData = data[validatorKey]
        const getFieldValidator = validators[validatorKey]
        const fieldValidator = getFieldValidator(data)

        // It is valid.
        if (fieldValidator === true) {
          const validations: FieldValidation[] = [{ name: validatorKey, isValid: true, errors: [] }]
          return validations
        }

        // A single error message.
        if (typeof fieldValidator === 'string') {
          const errors = [mapErrorMessage(fieldValidator)]
          const validations: FieldValidation[] = [{ name: validatorKey, isValid: false, errors }]
          return validations
        }

        // A list of error messages.
        if (Array.isArray(fieldValidator)) {
          const errors = fieldValidator.map((msg) => mapErrorMessage(msg))
          const validations: FieldValidation[] = [{ name: validatorKey, isValid: false, errors }]
          return validations
        }

        if (!isYrel(fieldValidator)) {
          throw new Error(
            'Form manager validators must be of type "true | string | string[] | DataSchema".'
          )
        }

        // Otherwise, it is a DataSchema.

        const schemaValidation = validateYrel(fieldValidator, fieldData, {
          rootKey: validatorKey as string
        })

        if (schemaValidation.isValid) {
          return [{ name: validatorKey, isValid: true, errors: [] }]
        }

        const validations = schemaValidation.issues
          .map((issue) => {
            const errors = issue.errors.map((err) => {
              if (err[0] === 'err_custom') {
                const [, code, vars] = err
                return mapErrorMessage(code, vars)
              }
              const [code, vars] = err
              return mapErrorMessage(code, vars)
            })
            return { ...issue, errors }
          })
          .map(({ key, errors }) => {
            if (key === validatorKey) {
              return { name: key, isValid: schemaValidation.isValid, errors }
            }
            return { name: key, isValid: !!errors.length, errors }
          })

        return validations
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
    }
    else {
      state.errors.set(Object.freeze({}))
    }
  }
}

export { createFormValidator }
