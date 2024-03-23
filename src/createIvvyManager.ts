// TODO: Add support for Yrel schemas transformations/defaults from validators.

// TODO: Clean up specific form and fields elements if they are unmounted.
// The Svelte `use:action` return `destroy` function can be used and the initial
// value should be set.

// TODO: Add side-effects functionality to allow to update data values when
// specific values change under certain conditions.

// TODO: Add option for event types to mark an element as touched.

import { writable, get } from 'svelte/store'
import type {
  IvvyManagerFieldElement,
  IvvyManagerFieldsData,
  IvvyManagerFieldsTouches,
  IvvyManagerFieldsErrors,
  IvvyManagerState,
  IvvyManagerProps,
  IvvyManager
} from './types.js'
import {
  setFieldElementValue,
  createFormValidator,
  createUseFormElement,
  createUseFieldElement
} from './internal/index.js'

const createIvvyManager = <Data extends Record<string, unknown>>(
  props: IvvyManagerProps<Data>
): IvvyManager<Data> => {
  const state: IvvyManagerState<Data> = Object.freeze({
    domListeners: writable<Array<[HTMLElement, string, (event: Event) => void]>>([]),
    fieldsElements: writable<Partial<Record<keyof Data, IvvyManagerFieldElement[]>>>({}),
    isValid: writable(false),
    isTouched: writable(false),
    data: writable<IvvyManagerFieldsData<Data>>(Object.freeze(props.initialData) as Data),
    touches: writable<IvvyManagerFieldsTouches<Data>>(Object.freeze({})),
    errors: writable<IvvyManagerFieldsErrors<Data>>(Object.freeze({}))
  })

  const validate = createFormValidator<Data>(props, state)
  const useFormElement = createUseFormElement<Data>(props, state)
  const useFieldElement = createUseFieldElement<Data>(props, state)

  const reset = (): void => {
    const fieldsElementsValue = get(state.fieldsElements)
    const fieldsKeys = Object.keys(fieldsElementsValue) as Array<keyof Data>

    for (const fieldKey of fieldsKeys) {
      const elements = fieldsElementsValue[fieldKey]
      const value = props.initialData[fieldKey]

      if (Array.isArray(elements)) {
        setFieldElementValue(fieldKey, elements, value)
      }
    }

    // Reset state.
    state.data.set(Object.freeze(props.initialData) as Data)
    state.isTouched.set(false)
    state.touches.set(Object.freeze({}))
  }

  const destroy = (): void => {
    // Remove HTML element event listeners.
    get(state.domListeners).forEach(([element, eventName, listener]) => {
      element.removeEventListener(eventName, listener)
    })
    state.domListeners.set([])

    // Remove fields elements references.
    state.fieldsElements.set({})

    // Reset state.
    state.data.set(Object.freeze(props.initialData) as Data)
    state.isTouched.set(false)
    state.touches.set(Object.freeze({}))
  }

  state.data.subscribe(() => {
    validate()
  })

  const setData = (newData: Partial<Data>): void => {
    const names = Object.keys(newData) as Array<keyof Data>
    const fieldsElementsValue = get(state.fieldsElements)

    for (const name of names) {
      const value = newData[name]
      const fieldElements = fieldsElementsValue[name]

      if (fieldElements) {
        setFieldElementValue<Data>(name, fieldElements, value)
      }
    }

    state.data.update((data) => ({ ...data, ...newData }))
  }

  const formManager = {
    isValid: state.isValid,
    isTouched: state.isTouched,
    data: state.data,
    touches: state.touches,
    errors: state.errors,
    validate,
    reset,
    destroy,
    setData,
    useFormElement,
    useFieldElement
  }

  return formManager
}

export { createIvvyManager }
