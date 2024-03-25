// TODO: Add side-effects functionality to allow to update data values when
// specific values change under certain conditions.

// TODO: Add option for event types to mark an element as touched.

import { writable, get } from 'svelte/store'
import type {
  IvvyFieldElement,
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
    fieldsElements: writable<Partial<Record<keyof Data, IvvyFieldElement[]>>>({}),
    formElement: writable<HTMLFormElement | null>(null),
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

  let isOnUpdateFirstCall = true

  const reset = (): void => {
    state.sourceData.set(Object.freeze(props.initialData) as Data)
    state.isTouched.set(false)
    state.touches.set(Object.freeze({}))
  }

  const setData = (newData: { [P in keyof Data]?: Data[P] | undefined | null }): void => {
    state.sourceData.set(Object.freeze({ ...get(state.data), ...newData }))
  }

  const unsubscribeValidation = state.sourceData.subscribe(() => {
    validate()
  })

  const unsubscribeUpdates = state.data.subscribe(() => {
    const dataNew = get(state.data)
    const fieldsElementsValue = get(state.fieldsElements)
    const fieldsKeys = Object.keys(fieldsElementsValue) as Array<keyof Data>

    for (const fieldKey of fieldsKeys) {
      const elements = fieldsElementsValue[fieldKey]
      const value = dataNew[fieldKey]

      if (Array.isArray(elements)) {
        setFieldElementValue(elements, value)
      }
    }

    if (isOnUpdateFirstCall) {
      isOnUpdateFirstCall = false
    } else {
      props.onUpdate?.(get(state.data))
    }
  })

  const destroy = (): void => {
    unsubscribeValidation()
    unsubscribeUpdates()

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
