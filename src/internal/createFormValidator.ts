import { get } from 'svelte/store'
import { type YrelErrorTranslations, type YrelSchema, isYrel, validateYrel } from 'yrel'
import { type UktiLocales, createUktiTranslator } from 'ukti'

import type { IvvyManagerFieldsErrors, IvvyManagerProps, IvvyManagerState } from '../types'

const createFormValidator = <Data extends Record<string, unknown>>(
  props: IvvyManagerProps<Data>,
  state: IvvyManagerState<Data>
): (() => void) => {
  const { locale, translations } = props

  interface FieldValidation {
    name: keyof Data
    isValid: boolean
    errors: string[]
  }

  type MapErrorMessage = (msg: string, vars?: unknown) => string

  const createMapErrorMessage = (): MapErrorMessage => {
    if (locale && translations) {
      const translate = createUktiTranslator<YrelErrorTranslations>({
        locale,
        translations: translations as Record<UktiLocales, Record<keyof YrelErrorTranslations, string>>
      })

      return (msg, vars) => {
        const translation = (translate[msg as keyof YrelErrorTranslations] as any)(vars as any)
        return translation || msg
      }
    }

    return (msg) => msg
  }

  const mapErrorMessage = createMapErrorMessage()

  return (): void => {
    const data = get(state.data)
    const validatorsKeys = Object.keys(props.validators) as Array<keyof Data>

    const fieldsValidations: FieldValidation[] = validatorsKeys
      .map((validatorKey) => {
        const fieldData = data[validatorKey]
        const getFieldValidator = props.validators[validatorKey]
        const fieldValidator = typeof getFieldValidator === 'function'
          ? getFieldValidator(data)
          : getFieldValidator

        // It is valid.
        if (fieldValidator === true) {
          const validations: FieldValidation[] = [{ name: validatorKey, isValid: true, errors: [] }]
          return validations
        }

        // A list of error messages.
        if (Array.isArray(fieldValidator)) {
          if (!fieldValidator.length) {
            throw new Error(
              'Ivvy form manager validators must be of type "YrelSchema | data => true | [string, ...string[]]".'
            )
          }

          const errors = fieldValidator.map((msg) => mapErrorMessage(msg))
          const validations: FieldValidation[] = [{ name: validatorKey, isValid: false, errors }]
          return validations
        }

        if (!isYrel(fieldValidator as YrelSchema)) {
          throw new Error(
            'Ivvy form manager validators must be of type "YrelSchema | data => true | [string, ...string[]]".'
          )
        }

        // Otherwise, it is a Yrel schema.

        const schemaValidation = validateYrel(fieldValidator as YrelSchema, fieldData, {
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
