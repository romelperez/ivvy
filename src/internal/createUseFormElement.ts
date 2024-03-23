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

      // Set all form fields as dirty.
      const dirtiesInitial = Object.keys(initialData).reduce(
        (total, key) => ({ ...total, [key]: true }),
        {}
      )
      state.touches.set(dirtiesInitial as Record<keyof Data, true>)
      state.isTouched.set(true)

      if (get(state.isValid)) {
        onSubmit?.(get(state.data), event)
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
          firstErrorElement.focus?.()
          firstErrorElement.scrollIntoView?.({
            block: 'center',
            behavior: 'instant' as any // Unknown type error.
          })
        }
      }
    }

    formElement.addEventListener('submit', onFormSubmit)

    state.domListeners.update((values) => [...values, [formElement, 'submit', onFormSubmit]])
  }
}

export type { UseFormElement }
export { createUseFormElement }
