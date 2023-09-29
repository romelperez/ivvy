# Ivvy

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

## Basic Usage

Ivvy provides a TypeScript API to configure an universal form manager with easy
to define validators and error translations.

```svelte
<script lang="ts">
  import { type IvvyManager, createIvvyManager } from 'ivvy'
  import { type InferYrel, type YrelErrorTranslations, y } from 'yrel'
  import { type UktiTranslations } from 'ukti'

  const schema = y.object({
    name: y.string().min(2).max(20),
    age: y.number().gte(18).lte(150).nullable()
  })

  type Schema = InferYrel<typeof schema>

  const translations: UktiTranslations<YrelErrorTranslations> = {
    en: {
      err_number: 'A valid number is required.',
      err_number_gte: 'This number should be at least {{gte}}.',
      err_number_lte: 'This number should be at most {{lte}}.',
      err_string: 'A valid text is required.',
      err_string_min: 'This field should have at least {{min}} character{{min === 1 ? "" : "s"}}.',
      err_string_max: 'This field should have at most {{max}} character{{max === 1 ? "" : "s"}}.',
      // ...
    }
  }

  const manager = createIvvyManager<Schema>({
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
    onSubmit (data) {
      console.log(data)
    }
  })

  const { touches, errors, useFormElement, useFieldElement } = manager

  onDestroy(() => manager.destroy())
</script>

<form use:useFormElement>
  <label>
    Name:
    <input name="name" type="text" use:useFieldElement />
    <div>{$touches.name && $errors.name?.[0] || ''}</div>
  </label>

  <label>
    Age:
    <input name="age" type="number" use:useFieldElement />
    <div>{$touches.age && $errors.age?.[0] || ''}</div>
  </label>

  <button type="submit">Submit</button>
</form>
```

The [Yrel](https://github.com/romelperez/yrel) schema can be reused in Node.js APIs or multiple forms.

The translations are optional but would provide a better user experience.
