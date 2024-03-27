import { type YrelErrorTranslations, type YrelSchema, isYrel, validateYrel } from 'yrel'
import { type UktiLanguages, type UktiTranslations, createUktiTranslator } from 'ukti'

import type {
  IvvyLanguageDefault,
  IvvyManagerPropsValidators,
  IvvyManagerFieldsErrors,
  IvvyManagerState
} from '../types.js'

type ObjectWriteable<T> = {
  -readonly [P in keyof T]: T[P]
}

const createFormValidator = <
  Data extends Record<string, unknown>,
  Languages extends string = UktiLanguages,
  LanguageDefault extends string = IvvyLanguageDefault
>(
  state: IvvyManagerState<Data, Languages, LanguageDefault>
): (() => void) => {
  return (): void => {
    const { validators, language, translations } = state.props.get()
    const dataNew: ObjectWriteable<Data> = { ...state.sourceData.get() }

    const createMapErrorMessage = (): ((msg: string, vars?: unknown) => string) => {
      if (translations) {
        // Since this is an internal functionality, the type checking is ignored.
        // This is verified in the unit test cases.
        const translator = createUktiTranslator<YrelErrorTranslations>({
          languageDefault: language as IvvyLanguageDefault,
          translations: translations as UktiTranslations<YrelErrorTranslations>
        })

        const translate = translator(language as UktiLanguages)

        return (msg, vars) => {
          const translation = (translate[msg as keyof YrelErrorTranslations] as any)(vars as any)
          return translation || msg
        }
      }

      return (msg) => msg
    }

    const mapErrorMessage = createMapErrorMessage()

    if (isYrel(validators)) {
      const schema = validators as YrelSchema<Data>
      const validation = validateYrel(schema, dataNew)

      state.isValid.set(validation.isValid)

      if (validation.isValid) {
        state.errors.set(Object.freeze({}))
        state.data.set(Object.freeze(validation.data))
      } else {
        const newErrorsValue = validation.issues
          .map(({ key, errors }) => ({
            [key]: errors.map((err) => {
              if (err[0] === 'err_custom') {
                const [, code, vars] = err
                return mapErrorMessage(code, vars)
              }
              const [code, vars] = err
              return mapErrorMessage(code, vars)
            })
          }))
          .reduce((total, item) => ({ ...total, ...item }), {})

        state.errors.set(Object.freeze(newErrorsValue) as unknown as IvvyManagerFieldsErrors<Data>)
        state.data.set(Object.freeze(dataNew))
      }

      return
    }

    const validatorsObject = validators as Exclude<IvvyManagerPropsValidators<Data>, YrelSchema>
    const validatorsKeys = Object.keys(validatorsObject) as Array<keyof Data>

    interface FieldValidation {
      name: keyof Data
      isValid: boolean
      errors: string[]
    }

    const fieldsValidations: FieldValidation[] = validatorsKeys
      .map((validatorKey) => {
        const fieldDOMData = dataNew[validatorKey]
        const getFieldValidator = validatorsObject[validatorKey]
        const fieldValidator =
          typeof getFieldValidator === 'function' ? getFieldValidator(dataNew) : getFieldValidator

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

        // Otherwise, it should be a Yrel schema.

        if (!isYrel(fieldValidator)) {
          throw new Error(
            'Ivvy form manager validators must be of type "YrelSchema | (data => true | [string, ...string[]]) | (data => YrelSchema)".'
          )
        }

        const validation = validateYrel(fieldValidator as YrelSchema, fieldDOMData, {
          rootKey: validatorKey as string
        })

        if (validation.isValid) {
          dataNew[validatorKey] = validation.data
          return [{ name: validatorKey, isValid: true, errors: [] }]
        }

        const fieldValidations = validation.issues
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
          .map(({ key, errors }) => ({
            name: key,
            isValid: false,
            errors
          }))

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

    state.data.set(Object.freeze(dataNew))
  }
}

export { createFormValidator }
