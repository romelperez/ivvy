# Ivvy

[![version](https://img.shields.io/npm/v/ivvy)](https://npmjs.org/package/ivvy)
[![tests](https://github.com/romelperez/ivvy/workflows/tests/badge.svg)](https://github.com/romelperez/ivvy/actions)
[![codefactor](https://www.codefactor.io/repository/github/romelperez/ivvy/badge)](https://www.codefactor.io/repository/github/romelperez/ivvy)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/ivvy.svg)](https://bundlephobia.com/package/ivvy)
[![downloads](https://img.shields.io/npm/dm/ivvy.svg)](https://npmjs.org/package/ivvy)
[![github stars](https://img.shields.io/github/stars/romelperez/ivvy.svg?style=social&label=stars)](https://github.com/romelperez/ivvy)
[![license](https://img.shields.io/github/license/romelperez/ivvy.svg)](https://github.com/romelperez/ivvy/blob/main/LICENSE)

Svelte form manager with dynamic type safe validators and i18n/l10n support.

## Install

For any ESM and CommonJS JavaScript environment. Svelte 4 is required.
If TypeScript is used, version 4.5+ is required.

```bash
npm i ivvy
```

[Yrel](https://github.com/romelperez/yrel) can be used for dynamic validations and
[Ukti](https://github.com/romelperez/ukti) for error reports l10n and i18n.

```bash
npm i yrel ukti
```

## Example Usage

Ivvy provides a TypeScript API to configure an universal form manager with easy
to define validators and error translations.

```svelte
<script lang="ts">
  import { onDestroy } from 'svelte'
  import { createIvvyManager } from 'ivvy'
  import { type InferYrel, type YrelErrorTranslations, y } from 'yrel'
  import type { UktiTranslations } from 'ukti'

  const schema = y.object({
    name: y.string().min(2).max(20),
    age: y.number().gte(18).lte(150).nullable()
  })

  type FormData = InferYrel<typeof schema>

  const translations: UktiTranslations<YrelErrorTranslations> = {
    en: {
      err_number: 'A valid number is required.',
      err_number_gte: 'This number should be at least {{gte}}.',
      err_number_lte: 'This number should be at most {{lte}}.',
      err_string: 'A valid text is required.',
      err_string_min: 'This field should have at least {{min}} character{{min === 1 ? "" : "s"}}.',
      err_string_max: 'This field should have at most {{max}} character{{max === 1 ? "" : "s"}}.'
      // ...
    } as Record<keyof YrelErrorTranslations, string>
  }

  const manager = createIvvyManager<FormData>({
    preventSubmit: 'always',
    initialData: {
      name: 'Ivvy',
      age: 21
    },
    formatters: {
      age: (value) => (isNaN(Number(value)) ? null : Number(value))
    },
    validators: schema.shape,
    locale: 'en',
    translations,
    onSubmit: (data) => console.log(data)
  })

  const { touches, errors, useFormElement, useFieldElement } = manager

  onDestroy(() => manager.destroy())
</script>

<form use:useFormElement>
  <label>
    Name:
    <input name="name" type="text" use:useFieldElement />
    <div>{($touches.name && $errors.name?.[0]) || ''}</div>
  </label>

  <label>
    Age:
    <input name="age" type="number" use:useFieldElement />
    <div>{($touches.age && $errors.age?.[0]) || ''}</div>
  </label>

  <button type="submit">Submit</button>
</form>
```

The [Yrel](https://github.com/romelperez/yrel) schema can be reused in Node.js APIs
or multiple forms.

The [Ukti](https://github.com/romelperez/ukti) translations are optional but would
provide a better user experience.

## Form Data

The manager form data has to be an object and each property representing a form field.
Each field can be of any kind of data.

The initial data object has to have all the properties. They can be `undefined` / `null`.

```ts
import { createIvvyManager } from 'ivvy'

type FormData = {
  name: string
  age: number
}

const manager = createIvvyManager<FormData>({
  initialData: {
    name: null,
    age: null
  }
  // ...
})
```

## Validators

The form data validators have to be explicitely defined for each object property.

The validators can be defined using [Yrel](https://github.com/romelperez/yrel) schema validations.

```ts
import { createIvvyManager } from 'ivvy'
import { type InferYrel, y } from 'yrel'

const schema = y.object({
  name: y.string().min(2).max(20),
  age: y.number().gte(18).lte(150).nullable()
})

type FormData = InferYrel<typeof schema>

const manager = createIvvyManager<FormData>({
  initialData: {
    name: 'Ivvy',
    age: 21
  },
  validators: schema.shape
})
```

Validators can be individual Yrel schema validators.

```ts
import { createIvvyManager } from 'ivvy'
import { y } from 'yrel'

type FormData = {
  name: string
  age: number
}

const manager = createIvvyManager<FormData>({
  initialData: {
    name: 'Ivvy',
    age: 21
  },
  validators: {
    name: y.string().min(2).max(20),
    age: y.number().gte(18).lte(150).nullable()
  }
})
```

Validators can be dynamic Yrel schema validators based on the current form data.

```ts
import { createIvvyManager } from 'ivvy'
import { y } from 'yrel'

type FormData = {
  name: string
  age: number
}

const manager = createIvvyManager<FormData>({
  initialData: {
    name: 'Ivvy',
    age: 21
  },
  validators: {
    name: (data) => y.string().min(2).max(20),
    age: (data) => y.number().gte(18).lte(150).nullable()
  }
})
```

Validators can be any function validating the input data and returning `true` as valid
or an array of string error reports.

```ts
import { createIvvyManager } from 'ivvy'

type FormData = {
  name: string
  age: number
}

const manager = createIvvyManager<FormData>({
  initialData: {
    name: 'Ivvy',
    age: 21
  },
  validators: {
    name: (data) => data.name.length > 2 || ['min length 2'],
    age: (data) => data.age > 18 || ['min value 18']
  }
})
```

## Formatters

A form field value can be formatted from user input before validations.
These functions will not apply for the initial data provided in settings
nor dynamic data updates.

```ts
import { createIvvyManager } from 'ivvy'

type FormData = {
  name: string
  age: number
}

const manager = createIvvyManager<FormData>({
  initialData: {
    name: 'Ivvy',
    age: 21
  },
  formatters: {
    // Make all text uppercase.
    name: (value) => String(value).toUpperCase(),
    // Make it `null` if not a valid input number.
    age: (value) => (isNaN(Number(value)) ? null : Number(value))
  },
  validators: {
    name: () => true,
    age: () => true
  }
})
```

## Translations

[Ukti](https://github.com/romelperez/ukti) can be used for error translations and
in combination with [Yrel](https://github.com/romelperez/yrel) schema validators reports.

```ts
import { createIvvyManager } from 'ivvy'
import { type InferYrel, y } from 'yrel'
import type { UktiTranslations } from 'ukti'

const schema = y.object({
  name: y.string().min(2).max(20),
  age: y.number().gte(18).lte(150).nullable()
})

type FormData = InferYrel<typeof schema>

const translations: UktiTranslations<YrelErrorTranslations> = {
  en: {
    err_number: 'A valid number is required.',
    err_number_gte: 'This number should be at least {{gte}}.',
    err_number_lte: 'This number should be at most {{lte}}.',
    err_string: 'A valid text is required.',
    err_string_min: 'This field should have at least {{min}} character{{min === 1 ? "" : "s"}}.',
    err_string_max: 'This field should have at most {{max}} character{{max === 1 ? "" : "s"}}.'
    // ...
  } as Record<keyof YrelErrorTranslations, string>,
  es: {
    err_number: 'Un número válido es requerido.',
    err_number_gte: 'El número debe ser al menos {{gte}}.',
    err_number_lte: 'El número debe ser por mucho {{lte}}.',
    err_string: 'Un texto válido es requerido.',
    err_string_min: 'El texto debe tener al menos {{min}} carácteres{{min === 1 ? "" : "s"}}.',
    err_string_max: 'El texto debe tener por mucho {{max}} carácteres{{max === 1 ? "" : "s"}}.'
    // ...
  } as Record<keyof YrelErrorTranslations, string>
}

const manager = createIvvyManager<FormData>({
  initialData: {
    name: 'Ivvy',
    age: 21
  },
  validators: schema.shape,
  locale: 'en',
  translations
})
```

## API

### `createIvvyManager<Data>(props: IvvyManagerProps<Data>): IvvyManager<Data>`

Create a form manager with the provided settings.

#### `IvvyManagerProps<Data>.initialData: { [P in keyof Required<Data>]: Data[P] | undefined | null }`

The initial form data. All fields are required. They can be `undefined` / `null`.

#### `IvvyManagerProps<Data>.validators: { [P in keyof Data]: YrelSchema<Data[P]> | ((data: Data) => true | string[] | YrelSchema<Data[P]>) }`

Each data field validator are required. They can be Yrel schema validators or
basic functions returning `true` or an array of string error messages `string[]`.

#### `IvvyManagerProps<Data>.formatters?: { [P in keyof Data]?: (value: unknown, data: Data) => Data[P] }`

Optional data fields formatters.

#### `IvvyManagerProps<Data>.preventSubmit?: 'always' | 'onError' | false = 'onError'`

Prevent default form submit functionalities.

#### `IvvyManagerProps<Data>.cleanInputFileValue?: boolean`

Remove the value of input type file after change event. This will allow the user
to re-select the same files if necessary.

#### `IvvyManagerProps<Data>.translations?: Partial<Record<UktiLocales, Partial<Record<keyof YrelErrorTranslations | (string & {}), string>>>>`

The translations for the error messages.

#### `IvvyManagerProps<Data>.locale?: UktiLocales = 'en'`

Any [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) locale/language
code to use from the `translations` provided.

#### `IvvyManagerProps<Data>.onUpdate?: (data: Data) => void`

On form field update callback.

#### `IvvyManagerProps<Data>.onSubmit?: (data: Data, event: Event) => void`

On form submit event callback when the form data is valid.
