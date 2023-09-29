# Ivvy

[![version](https://img.shields.io/npm/v/ivvy)](https://npmjs.org/package/ivvy)
[![tests](https://github.com/romelperez/ivvy/workflows/tests/badge.svg)](https://github.com/romelperez/ivvy/actions)
[![codefactor](https://www.codefactor.io/repository/github/romelperez/ivvy/badge)](https://www.codefactor.io/repository/github/romelperez/ivvy)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/ivvy.svg)](https://bundlephobia.com/package/ivvy)
[![downloads](https://img.shields.io/npm/dm/ivvy.svg)](https://npmjs.org/package/ivvy)
[![github stars](https://img.shields.io/github/stars/romelperez/ivvy.svg?style=social&label=stars)](https://github.com/romelperez/ivvy)
[![license](https://img.shields.io/github/license/romelperez/ivvy.svg)](https://github.com/romelperez/ivvy/blob/main/LICENSE)

Svelte form manager with dynamic type safe validators and l10n/i18n support.

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

## Initial Data

TODO

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

TODO

## Translations

TODO

## API

TODO
