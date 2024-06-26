/* eslint-disable @typescript-eslint/ban-types */

import type { YrelErrorTranslations, YrelSchema } from 'yrel'
import type { UktiLanguages } from 'ukti'

export type IvvyFieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

export type IvvyFieldValue =
  | boolean
  | number
  | string
  | File
  | Array<boolean | number | string | File>

export interface IvvyUseHookOutput {
  destroy: () => void
}

export type IvvyLanguageDefault = 'en'

export type IvvyWritable<Data> = {
  get: () => Data
  set: (data: Data) => void
  subscribe: (observer: (data: Data) => void) => () => void
}

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

export type IvvyManagerPropsValidators<Data extends Record<string, unknown>> =
  | YrelSchema
  | {
      [P in keyof Data]?:
        | YrelSchema<Data[P]>
        | ((data: Data) => true | string[] | YrelSchema<Data[P]>)
    }

export type IvvyManagerPropsTranslations<
  Languages extends string = UktiLanguages,
  LanguageDefault extends string = IvvyLanguageDefault
> = Partial<
  Record<Languages, Partial<Record<keyof YrelErrorTranslations | (string & {}), string>>>
> & {
  [L in LanguageDefault]: Partial<Record<keyof YrelErrorTranslations | (string & {}), string>>
}

export type IvvyManagerProps<
  Data extends Record<string, unknown>,
  Languages extends string = UktiLanguages,
  LanguageDefault extends string = IvvyLanguageDefault
> = {
  initialData: IvvyManagerInitialData<Data>
  validators?: IvvyManagerPropsValidators<Data>
  formatters?: IvvyManagerPropsFormatters<Data>
  preventSubmit?: 'always' | 'onError' | false
  cleanInputFileValue?: boolean
  translations?: IvvyManagerPropsTranslations<Languages, LanguageDefault>
  onUpdate?: (data: Data) => void
  onSubmit?: (data: Data, event: Event) => void
} & (LanguageDefault extends IvvyLanguageDefault
  ? { language?: Languages }
  : { language: Languages })

export type IvvyManagerPropsInternal<
  Data extends Record<string, unknown>,
  Languages extends string = UktiLanguages,
  LanguageDefault extends string = IvvyLanguageDefault
> = IvvyManagerProps<Data, Languages, LanguageDefault> &
  Required<
    Pick<
      IvvyManagerProps<Data, Languages, LanguageDefault>,
      'validators' | 'preventSubmit' | 'cleanInputFileValue' | 'language'
    >
  >

export type IvvyManagerPropsUpdateable<
  Data extends Record<string, unknown>,
  Languages extends string = UktiLanguages,
  LanguageDefault extends string = IvvyLanguageDefault
> = Partial<
  Pick<
    IvvyManagerProps<Data, Languages, LanguageDefault>,
    | 'validators'
    | 'formatters'
    | 'preventSubmit'
    | 'cleanInputFileValue'
    | 'language'
    | 'translations'
  >
>

export type IvvyManagerState<
  Data extends Record<string, unknown>,
  Languages extends string = UktiLanguages,
  LanguageDefault extends string = IvvyLanguageDefault
> = {
  props: IvvyWritable<IvvyManagerPropsInternal<Data, Languages, LanguageDefault>>
  domListeners: IvvyWritable<Array<[HTMLElement, string, (event: Event) => void]>>
  fieldsElements: IvvyWritable<Partial<Record<keyof Data, IvvyFieldElement[]>>>
  formElement: IvvyWritable<HTMLFormElement | null>
  /**
   * The form data directly from the form DOM elements or as provided by the user.
   * This data is after "formatters" and before Yrel validation transformations.
   */
  sourceData: IvvyWritable<IvvyManagerFieldsData<Data>>
  /**
   * If the form "data" is valid.
   */
  isValid: IvvyWritable<boolean>
  /**
   * The form data after "formatters" and Yrel validation transformations if provided.
   */
  data: IvvyWritable<IvvyManagerFieldsData<Data>>
  /**
   * The form fields if they have errors or not.
   * If a field has an error, it will be a list of message texts.
   * Otherwise, it is undefined.
   */
  errors: IvvyWritable<IvvyManagerFieldsErrors<Data>>
  /**
   * If any of the form elements have been touched by the user.
   * If the form has been submitted at least once, it is also marked as touched.
   */
  isTouched: IvvyWritable<boolean>
  /**
   * The form fields if they have been touched or not.
   */
  touches: IvvyWritable<IvvyManagerFieldsTouches<Data>>
}

export interface IvvyManager<
  Data extends Record<string, unknown>,
  Languages extends string = UktiLanguages,
  LanguageDefault extends string = IvvyLanguageDefault
> {
  /**
   * If the form "data" is valid.
   */
  isValid: IvvyWritable<boolean>
  /**
   * The form data after "formatters" and Yrel validation transformations if provided.
   */
  data: IvvyWritable<IvvyManagerFieldsData<Data>>
  /**
   * The form fields if they have errors or not.
   * If a field has an error, it will be a list of message texts.
   * Otherwise, it is undefined.
   */
  errors: IvvyWritable<IvvyManagerFieldsErrors<Data>>
  /**
   * If any of the form elements have been touched by the user.
   * If the form has been submitted at least once, it is also marked as touched.
   */
  isTouched: IvvyWritable<boolean>
  /**
   * The form fields if they have been touched or not.
   */
  touches: IvvyWritable<IvvyManagerFieldsTouches<Data>>
  /**
   * Update the props partially.
   */
  update: (newProps: IvvyManagerPropsUpdateable<Data, Languages, LanguageDefault>) => void
  /**
   * Reset the state of the form manager as it was initially defined.
   */
  reset: () => void
  /**
   * Reset the form manager state and remove all DOM event listeners.
   */
  destroy: () => void
  /**
   * Partially update the form data, even with invalid data.
   */
  setData: (data: { [P in keyof Data]?: Data[P] | undefined | null }) => void
  /**
   * Add the HTMLFormElement to the manager. It will get a submit DOM event listener.
   * @param element HTMLFormElement
   */
  useFormElement: (element: HTMLFormElement) => IvvyUseHookOutput
  /**
   * Add a form element to the manager. It will read its `name` attribute and
   * use it as its field name. According to the type of HTMLElement, it will get
   * DOM event listeners to listen to user input for data updates.
   * @param element The field form element. e.g. HTMLInputElement.
   */
  useFieldElement: (element: IvvyFieldElement) => IvvyUseHookOutput
}
