import { get } from 'svelte/store'
import type { IvvyManagerProps, IvvyManagerState } from '../types.js'

type UseFormElement = (formElement: HTMLFormElement) => void

const createUseFormElement = <Data extends Record<string, unknown>>(
  props: IvvyManagerProps<Data>,
  state: IvvyManagerState<Data>
): UseFormElement => {
  const { initialData, preventSubmit = 'onError', onSubmit } = props

  return (formElement) => {
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
          firstErrorElement.focus?.()
        }
      }
    }

    formElement.addEventListener('submit', onFormSubmit)

    state.domListeners.update((values) => [...values, [formElement, 'submit', onFormSubmit]])
  }
}

export { type UseFormElement, createUseFormElement }
