import type { UktiLanguages } from 'ukti'
import type { IvvyLanguageDefault, IvvyUseHookOutput, IvvyManagerState } from '../types.js'

const createUseFormElement = <
  Data extends Record<string, unknown>,
  Languages extends string = UktiLanguages,
  LanguageDefault extends string = IvvyLanguageDefault
>(
  state: IvvyManagerState<Data, Languages, LanguageDefault>
): ((formElement: HTMLFormElement) => IvvyUseHookOutput) => {
  return (formElement) => {
    if (!(formElement instanceof HTMLFormElement)) {
      throw new Error('Ivvy manager "useFormElement" was not provided a valid <form/> element.')
    }

    if (state.formElement.get()) {
      throw new Error('Ivvy manager already has an existing form configured.')
    }

    const onFormSubmit = (event: Event): void => {
      const { initialData, preventSubmit, onSubmit } = state.props.get()

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

      if (state.isValid.get()) {
        onSubmit?.(Object.freeze(state.data.get()), event)
      } else {
        if (preventSubmit === 'onError') {
          event.preventDefault()
        }

        // Focus first element with error.

        const errors = state.errors.get()
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

      state.domListeners.set(
        state.domListeners.get().filter(([element, eventName, listener]) => {
          if (element === formElement) {
            formElement.removeEventListener(eventName, listener)
          }
          return element !== formElement
        })
      )
    }

    state.formElement.set(formElement)

    formElement.addEventListener('submit', onFormSubmit)

    state.domListeners.set([...state.domListeners.get(), [formElement, 'submit', onFormSubmit]])

    return { destroy }
  }
}

export { createUseFormElement }
