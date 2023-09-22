/* eslint-disable @typescript-eslint/explicit-function-return-type */

import template from 'lodash/template'
import type { IvvyLocales } from './types'
import { IVVY_LOCALE_DEFAULT } from './constants'

// For text templates with variables in "string {{variable}} string..." format.
const textTemplateInterpolate = /{{([\s\S]+?)}}/g

const renderTextTemplate = <V extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  vars: V
): string => {
  const compiled = template(text, { interpolate: textTemplateInterpolate })
  return compiled(vars)
}

type BaseItemVariables = [Record<string, unknown>]

type BaseItem = undefined | BaseItemVariables

type BaseDefinition = Record<string, BaseItem | Record<string, BaseItem>>

type TranslationValues<Definition extends BaseDefinition> = {
  [P in keyof Definition]: Definition[P] extends BaseItemVariables
    ? string
    : undefined extends Definition[P]
      ? string
      : Definition[P] extends Record<string, BaseItem>
        ? Record<keyof Definition[P], string>
        : never
}

type IvvyTranslations<Definition extends BaseDefinition, Locales extends IvvyLocales, LocaleDefault extends IvvyLocales>
  = Partial<Record<Locales, TranslationValues<Definition>>> & Record<LocaleDefault, TranslationValues<Definition>>

const createIvvyTranslator = <
  Definition extends BaseDefinition,
  Locales extends IvvyLocales = IvvyLocales,
  LocaleDefault extends IvvyLocales = typeof IVVY_LOCALE_DEFAULT
>(
    props: {
      translations: IvvyTranslations<Definition, Locales, LocaleDefault>
      locale: Locales
      localeDefault?: LocaleDefault
    }
  ) => {
  const { translations, locale, localeDefault } = props

  return <
    Dictionary extends {
      [A in keyof Definition]: Definition[A] extends Record<string, unknown>
        ? {
            [B in keyof Definition[A]]: [`${string & A}.${string & B}`, Definition[A][B]]
          }[keyof Definition[A]]
        : [`${string & A}`, Definition[A]]
    }[keyof Definition],
    Path extends Dictionary extends [infer A, BaseItem] ? A : never,
    Item extends Dictionary extends [Path, infer B] ? B : never,
    Params extends Item extends BaseItemVariables ? Item : [undefined?]
  >(
    path: Path,
    ...params: Params
  ): string => {
    const definition = translations[locale] ?? translations[(localeDefault ?? IVVY_LOCALE_DEFAULT) as LocaleDefault]

    if (!definition) {
      return ''
    }

    const fragments = path.split('.')
    const [parent, child] = fragments
    const [variables] = params as [Record<string, unknown>]

    const template =
      fragments.length === 1 // Parent provided.
        ? definition[parent]
        : fragments.length === 2 // Parent.Child provided.
          ? (definition[parent] as any)?.[child]
          : null // Unknown number of fragments provided.

    if (!template) {
      return ''
    }

    if (variables) {
      try {
        return renderTextTemplate(template, variables)
      }
      catch (err) {
        throw new Error(
          `The translation for the key "${path}" did not receive the expected variables. ${
            err instanceof Error ? `${err.message}.` : ''
          }`
        )
      }
    }

    return template
  }
}

export type { IvvyTranslations }
export { createIvvyTranslator }
