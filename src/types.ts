/* eslint-disable @typescript-eslint/ban-types */

import type { Writable } from 'svelte/store'
import type { YrelErrorTranslations, YrelSchema } from 'yrel'
import type { UktiLanguages } from 'ukti'

export type IvvyManagerFieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

export type IvvyManagerFieldsData<Data extends Record<string, unknown>> = Readonly<Data>

export type IvvyManagerInitialData<Data extends Record<string, unknown>> = {
  [P in keyof Required<Data>]: Data[P] | undefined | null
}

export type IvvyManagerFieldsTouches<Data extends Record<string, unknown>> = Readonly<
  Partial<Record<keyof Data, boolean>>
>

export type IvvyManagerFieldsErrors<Data extends Record<string, unknown>> = Readonly<
  Partial<
    // Certain Yrel validations may generate reports for object nested properties dynamically.
    // Example: A list of elements with the key "myList" and each one with its respective input field,
    // if there is an error in the third field, it is reported as "myList.2" in this errors report object.
    // `UnionType | (string & {})` does the trick.
    Record<keyof Data | (string & {}), string[]>
  >
>

export type IvvyManagerPropsFormatters<Data extends Record<string, unknown>> = {
  [P in keyof Data]?: (value: unknown, data: Data) => Data[P]
}

export type IvvyManagerPropsValidators<Data extends Record<string, unknown>> = {
  [P in keyof Data]?: YrelSchema<Data[P]> | ((data: Data) => true | string[] | YrelSchema<Data[P]>)
}

export type IvvyManagerPropsTranslations<
  Languages extends string = UktiLanguages,
  LanguageDefault extends string = 'en'
> = Partial<
  Record<Languages, Partial<Record<keyof YrelErrorTranslations | (string & {}), string>>>
> & {
  [L in LanguageDefault]: Partial<Record<keyof YrelErrorTranslations | (string & {}), string>>
}

export interface IvvyManagerProps<
  Data extends Record<string, unknown>,
  Languages extends string = UktiLanguages,
  LanguageDefault extends string = 'en'
> {
  initialData: IvvyManagerInitialData<Data>
  validators?: IvvyManagerPropsValidators<Data>
  formatters?: IvvyManagerPropsFormatters<Data>
  preventSubmit?: 'always' | 'onError' | false
  cleanInputFileValue?: boolean
  language?: Languages
  translations?: IvvyManagerPropsTranslations<Languages, LanguageDefault>
  onUpdate?: (data: Data) => void
  onSubmit?: (data: Data, event: Event) => void
}

export type IvvyManagerPropsInternal<
  Data extends Record<string, unknown>,
  Languages extends string = UktiLanguages,
  LanguageDefault extends string = 'en'
> = IvvyManagerProps<Data, Languages, LanguageDefault> &
  Required<
    Pick<
      IvvyManagerProps<Data, Languages, LanguageDefault>,
      'preventSubmit' | 'cleanInputFileValue' | 'language' | 'validators'
    >
  >

export type IvvyManagerState<Data extends Record<string, unknown>> = {
  domListeners: Writable<Array<[HTMLElement, string, (event: Event) => void]>>
  fieldsElements: Writable<Partial<Record<keyof Data, IvvyManagerFieldElement[]>>>
  /**
   * The form data directly from the form DOM elements or by the user.
   * This data is before the "formatters" and Yrel validation transformations.
   */
  sourceData: Writable<IvvyManagerFieldsData<Data>>
  /**
   * If the form "data" is valid.
   */
  isValid: Writable<boolean>
  /**
   * If any of the form elements have been touched by the user.
   * If the form has been submitted at least once, it is also marked as touched.
   */
  isTouched: Writable<boolean>
  /**
   * The form data after "formatters" and Yrel validation transformations.
   */
  data: Writable<IvvyManagerFieldsData<Data>>
  /**
   * The form fields if they have been touched or not.
   */
  touches: Writable<IvvyManagerFieldsTouches<Data>>
  /**
   * The form fields if they have errors or not.
   * If a field has an error, it will be a list of message texts.
   * Otherwise, it is undefined.
   */
  errors: Writable<IvvyManagerFieldsErrors<Data>>
}

export interface IvvyManager<Data extends Record<string, unknown>> {
  isValid: Writable<boolean>
  isTouched: Writable<boolean>
  data: Writable<IvvyManagerFieldsData<Data>>
  touches: Writable<IvvyManagerFieldsTouches<Data>>
  errors: Writable<IvvyManagerFieldsErrors<Data>>
  validate: () => void
  reset: () => void
  destroy: () => void
  setData: (data: Partial<Data>) => void
  useFormElement: (element: HTMLFormElement) => void
  useFieldElement: (element: IvvyManagerFieldElement) => void
}
