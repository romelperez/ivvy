// TODO: Add support for select multiple element.

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
  IvvyManagerPropsInternal,
  IvvyManager
} from './types.js'
import {
  setFieldElementValue,
  createFormValidator,
  createUseFormElement,
  createUseFieldElement
} from './internal/index.js'

const createIvvyManager = <Data extends Record<string, unknown>>(
  providedProps: IvvyManagerProps<Data>
): IvvyManager<Data> => {
  const props: IvvyManagerPropsInternal<Data> = {
    preventSubmit: 'onError',
    cleanInputFileValue: true,
    language: 'en',
    validators: {},
    ...providedProps
  }

  const state: IvvyManagerState<Data> = Object.freeze({
    domListeners: writable<Array<[HTMLElement, string, (event: Event) => void]>>([]),
    fieldsElements: writable<Partial<Record<keyof Data, IvvyManagerFieldElement[]>>>({}),
    sourceData: writable<IvvyManagerFieldsData<Data>>(Object.freeze(props.initialData) as Data),
    isValid: writable(false),
    data: writable<IvvyManagerFieldsData<Data>>(Object.freeze(props.initialData) as Data),
    errors: writable<IvvyManagerFieldsErrors<Data>>(Object.freeze({})),
    isTouched: writable(false),
    touches: writable<IvvyManagerFieldsTouches<Data>>(Object.freeze({}))
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
    state.sourceData.set(Object.freeze(props.initialData) as Data)
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
    state.sourceData.set(Object.freeze(props.initialData) as Data)
    state.isTouched.set(false)
    state.touches.set(Object.freeze({}))
  }

  const setData = (newData: { [P in keyof Data]?: Data[P] | undefined | null }): void => {
    const dataOriginal = get(state.data)

    state.sourceData.set(Object.freeze({ ...dataOriginal, ...newData }))

    const dataUpdated = get(state.data)
    const names = Object.keys(props.initialData) as Array<keyof Data>
    const fieldsElementsValue = get(state.fieldsElements)

    for (const name of names) {
      const value = dataUpdated[name]
      const fieldElements = fieldsElementsValue[name]

      if (fieldElements) {
        setFieldElementValue<Data>(name, fieldElements, value)
      }
    }
  }

  state.sourceData.subscribe(() => {
    validate()
  })

  state.data.subscribe(() => {
    props.onUpdate?.(get(state.data))
  })

  const formManager = {
    isValid: state.isValid,
    data: state.data,
    errors: state.errors,
    touches: state.touches,
    isTouched: state.isTouched,
    reset,
    destroy,
    setData,
    useFormElement,
    useFieldElement
  }

  return formManager
}

export { createIvvyManager }
