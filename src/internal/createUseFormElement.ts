import { get } from 'svelte/store'
import type { UktiLanguages } from 'ukti'
import type { IvvyManagerPropsInternal, IvvyUseHookOutput, IvvyManagerState } from '../types.js'

const createUseFormElement = <
  Data extends Record<string, unknown>,
  Languages extends string = UktiLanguages,
  LanguageDefault extends string = 'en'
>(
  props: IvvyManagerPropsInternal<Data, Languages, LanguageDefault>,
  state: IvvyManagerState<Data>
): ((formElement: HTMLFormElement) => IvvyUseHookOutput) => {
  const { initialData, preventSubmit, onSubmit } = props

  return (formElement) => {
    if (!(formElement instanceof HTMLFormElement)) {
      throw new Error('Ivvy manager "useFormElement" was not provided a valid <form/> element.')
    }

    if (get(state.formElement)) {
      throw new Error('Ivvy manager already has an existing form configured.')
    }

    const onFormSubmit = (event: Event): void => {
      if (preventSubmit === 'always') {
        event.preventDefault()
      }

      // Set all form fields as touched.
      const touchesInitial = Object.keys(initialData).reduce(
        (total, key) => ({ ...total, [key]: true }),
        {}
      ) as Record<keyof Data, true>
      state.isTouched.set(true)
      state.touches.set(touchesInitial)

      if (get(state.isValid)) {
        onSubmit?.(Object.freeze(get(state.data)), event)
      } else {
        if (preventSubmit === 'onError') {
          event.preventDefault()
        }

        // Focus first element with error.

        const errors = get(state.errors)
        const [firstErrorKey] = Object.keys(errors)
        const firstErrorElement = formElement.querySelector<HTMLInputElement>(
          `[name="${firstErrorKey}"]`
        )

        if (firstErrorElement) {
          firstErrorElement.scrollIntoView?.({
            block: 'center',
            behavior: 'instant'
          })
          firstErrorElement.focus()
        }
      }
    }

    const destroy = (): void => {
      state.formElement.set(null)

      state.domListeners.update((domListeners) =>
        domListeners.filter(([element, eventName, listener]) => {
          if (element === formElement) {
            formElement.removeEventListener(eventName, listener)
          }
          return element !== formElement
        })
      )
    }

    state.formElement.set(formElement)

    formElement.addEventListener('submit', onFormSubmit)

    state.domListeners.update((domListeners) => [
      ...domListeners,
      [formElement, 'submit', onFormSubmit]
    ])

    return { destroy }
  }
}

export { createUseFormElement }
