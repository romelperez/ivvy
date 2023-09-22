/* eslint-disable @typescript-eslint/ban-types */

import type { Writable } from 'svelte/store'
import type { YrelErrorTranslations, YrelSchema } from 'yrel'

export type IvvyLocales =
  | 'ab'
  | 'aa'
  | 'af'
  | 'ak'
  | 'sq'
  | 'am'
  | 'ar'
  | 'an'
  | 'hy'
  | 'as'
  | 'av'
  | 'ae'
  | 'ay'
  | 'az'
  | 'bm'
  | 'ba'
  | 'eu'
  | 'be'
  | 'bn'
  | 'bi'
  | 'bs'
  | 'br'
  | 'bg'
  | 'my'
  | 'ca'
  | 'ch'
  | 'ce'
  | 'ny'
  | 'zh'
  | 'cu'
  | 'cv'
  | 'kw'
  | 'co'
  | 'cr'
  | 'hr'
  | 'cs'
  | 'da'
  | 'dv'
  | 'nl'
  | 'dz'
  | 'en'
  | 'eo'
  | 'et'
  | 'ee'
  | 'fo'
  | 'fj'
  | 'fi'
  | 'fr'
  | 'fy'
  | 'ff'
  | 'gd'
  | 'gl'
  | 'lg'
  | 'ka'
  | 'de'
  | 'el'
  | 'kl'
  | 'gn'
  | 'gu'
  | 'ht'
  | 'ha'
  | 'he'
  | 'hz'
  | 'hi'
  | 'ho'
  | 'hu'
  | 'is'
  | 'io'
  | 'ig'
  | 'id'
  | 'ia'
  | 'ie'
  | 'iu'
  | 'ik'
  | 'ga'
  | 'it'
  | 'ja'
  | 'jv'
  | 'kn'
  | 'kr'
  | 'ks'
  | 'kk'
  | 'km'
  | 'ki'
  | 'rw'
  | 'ky'
  | 'kv'
  | 'kg'
  | 'ko'
  | 'kj'
  | 'ku'
  | 'lo'
  | 'la'
  | 'lv'
  | 'li'
  | 'ln'
  | 'lt'
  | 'lu'
  | 'lb'
  | 'mk'
  | 'mg'
  | 'ms'
  | 'ml'
  | 'mt'
  | 'gv'
  | 'mi'
  | 'mr'
  | 'mh'
  | 'mn'
  | 'na'
  | 'nv'
  | 'nd'
  | 'nr'
  | 'ng'
  | 'ne'
  | 'no'
  | 'nb'
  | 'nn'
  | 'ii'
  | 'oc'
  | 'oj'
  | 'or'
  | 'om'
  | 'os'
  | 'pi'
  | 'ps'
  | 'fa'
  | 'pl'
  | 'pt'
  | 'pa'
  | 'qu'
  | 'ro'
  | 'rm'
  | 'rn'
  | 'ru'
  | 'se'
  | 'sm'
  | 'sg'
  | 'sa'
  | 'sc'
  | 'sr'
  | 'sn'
  | 'sd'
  | 'si'
  | 'sk'
  | 'sl'
  | 'so'
  | 'st'
  | 'es'
  | 'su'
  | 'sw'
  | 'ss'
  | 'sv'
  | 'tl'
  | 'ty'
  | 'tg'
  | 'ta'
  | 'tt'
  | 'te'
  | 'th'
  | 'bo'
  | 'ti'
  | 'to'
  | 'ts'
  | 'tn'
  | 'tr'
  | 'tk'
  | 'tw'
  | 'ug'
  | 'uk'
  | 'ur'
  | 'uz'
  | 've'
  | 'vi'
  | 'vo'
  | 'wa'
  | 'cy'
  | 'wo'
  | 'xh'
  | 'yi'
  | 'yo'
  | 'za'
  | 'zu'

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

export type IvvyManagerPropsValidators<Data extends Record<string, unknown>> = {
  [P in keyof Data]: (data: Data) => true | string | string[] | YrelSchema<Data[P]>
}

export interface IvvyManagerProps<Data extends Record<string, unknown>> {
  initialData: IvvyManagerInitialData<Data>
  formatters?: IvvyManagerPropsFormatters<Data>
  validators: IvvyManagerPropsValidators<Data>
  preventSubmit?: 'always' | 'onError' | false
  cleanInputFileValue?: boolean
  locale?: IvvyLocales
  translations?: Partial<Record<IvvyLocales, Partial<Record<keyof YrelErrorTranslations | (string & {}), string>>>>
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
  fields: {
    data: Writable<IvvyManagerFieldsData<Data>>
    touches: Writable<IvvyManagerFieldsTouches<Data>>
    errors: Writable<IvvyManagerFieldsErrors<Data>>
  }
  validate: () => void
  reset: () => void
  destroy: () => void
  setData: (data: Partial<Data>) => void
  useFormElement: (element: HTMLFormElement) => void
  useFieldElement: (element: IvvyManagerFieldElement) => void
}
