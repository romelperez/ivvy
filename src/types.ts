/* eslint-disable @typescript-eslint/ban-types */

import type { Writable } from 'svelte/store'
import type { YrelErrorTranslations, YrelSchema } from 'yrel'
import type { UktiLocales } from 'ukti'

export type IvvyManagerFieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

export type IvvyManagerFieldsData<Data extends Record<string, unknown>> = Readonly<Data>

export type IvvyManagerInitialData<Data extends Record<string, unknown>> = {
  [P in keyof Required<Data>]: Data[P] | undefined | null
}

export type IvvyManagerFieldsTouches<Data extends Record<string, unknown>> = Readonly<Partial<Record<keyof Data, boolean>>>

export type IvvyManagerFieldsErrors<Data extends Record<string, unknown>> = Readonly<Partial<Record<keyof Data & (string & {}), string[]>>>

export type IvvyManagerPropsFormatters<Data extends object> = {
  [P in keyof Data]?: (value: unknown, data: Data) => Data[P]
}

export type IvvyManagerPropsValidators<Data extends Record<string, unknown>> =
  { [P in keyof Data]: YrelSchema<Data[P]> | ((data: Data) => true | string[] | YrelSchema<Data[P]>) }

// TODO: Add custom translations definition configuration.
export interface IvvyManagerProps<Data extends Record<string, unknown>> {
  initialData: IvvyManagerInitialData<Data>
  validators: IvvyManagerPropsValidators<Data>
  formatters?: IvvyManagerPropsFormatters<Data>
  preventSubmit?: 'always' | 'onError' | false
  cleanInputFileValue?: boolean
  locale?: UktiLocales
  translations?: Partial<Record<UktiLocales, Partial<Record<keyof YrelErrorTranslations | (string & {}), string>>>>
  onUpdate?: (data: Data) => void
  onSubmit?: (data: Data, event: Event) => void
}

export type IvvyManagerState<Data extends Record<string, unknown>> = {
  domListeners: Writable<Array<[HTMLElement, string, (event: Event) => void]>>
  fieldsElements: Writable<Partial<Record<keyof Data, IvvyManagerFieldElement[]>>>
  isValid: Writable<boolean>
  isTouched: Writable<boolean>
  data: Writable<IvvyManagerFieldsData<Data>>
  touches: Writable<IvvyManagerFieldsTouches<Data>>
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
