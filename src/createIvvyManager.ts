import { writable, get } from 'svelte/store'
import type { UktiLanguages } from 'ukti'
import type {
  IvvyFieldElement,
  IvvyLanguageDefault,
  IvvyManagerFieldsData,
  IvvyManagerFieldsTouches,
  IvvyManagerFieldsErrors,
  IvvyManagerState,
  IvvyManagerProps,
  IvvyManagerPropsInternal,
  IvvyManagerPropsUpdateable,
  IvvyManager
} from './types.js'
import {
  setFieldElementValue,
  createFormValidator,
  createUseFormElement,
  createUseFieldElement
} from './internal/index.js'

const createIvvyManager = <
  Data extends Record<string, unknown>,
  Languages extends string = UktiLanguages,
  LanguageDefault extends string = IvvyLanguageDefault
>(
  providedProps: IvvyManagerProps<Data, Languages, LanguageDefault>
): IvvyManager<Data, Languages, LanguageDefault> => {
  const initialProps = {
    preventSubmit: 'onError',
    cleanInputFileValue: true,
    language: 'en',
    validators: {},
    ...(providedProps as unknown as object)
  } as unknown as IvvyManagerPropsInternal<Data, Languages, LanguageDefault>

  const state: IvvyManagerState<Data, Languages, LanguageDefault> = Object.freeze({
    props: writable(initialProps),
    domListeners: writable<Array<[HTMLElement, string, (event: Event) => void]>>([]),
    fieldsElements: writable<Partial<Record<keyof Data, IvvyFieldElement[]>>>({}),
    formElement: writable<HTMLFormElement | null>(null),
    sourceData: writable<IvvyManagerFieldsData<Data>>(
      Object.freeze(initialProps.initialData) as Data
    ),
    isValid: writable(false),
    data: writable<IvvyManagerFieldsData<Data>>(Object.freeze(initialProps.initialData) as Data),
    errors: writable<IvvyManagerFieldsErrors<Data>>(Object.freeze({})),
    isTouched: writable(false),
    touches: writable<IvvyManagerFieldsTouches<Data>>(Object.freeze({}))
  })

  const validate = createFormValidator<Data, Languages, LanguageDefault>(state)
  const useFormElement = createUseFormElement<Data, Languages, LanguageDefault>(state)
  const useFieldElement = createUseFieldElement<Data, Languages, LanguageDefault>(state)

  let isOnUpdateFirstCall = true

  const update = (propsNew: IvvyManagerPropsUpdateable<Data, Languages, LanguageDefault>): void => {
    const propsUpdateable = [
      'validators',
      'formatters',
      'preventSubmit',
      'cleanInputFileValue',
      'language',
      'translations'
    ] as const
    const propsToUpdate: IvvyManagerPropsUpdateable<Data, Languages, LanguageDefault> = {}

    for (const propUpdateable of propsUpdateable) {
      if (propsNew[propUpdateable] !== undefined) {
        propsToUpdate[propUpdateable] = propsNew[propUpdateable] as any
      }
    }

    state.props.update((props) => ({ ...props, ...propsToUpdate }))
  }

  const reset = (): void => {
    const { initialData } = get(state.props)

    state.sourceData.set(Object.freeze(initialData) as Data)
    state.isTouched.set(false)
    state.touches.set(Object.freeze({}))
  }

  const setData = (newData: { [P in keyof Data]?: Data[P] | undefined | null }): void => {
    state.sourceData.set(Object.freeze({ ...get(state.data), ...newData }))
  }

  const unsubscribePropsObserver = state.props.subscribe(() => {
    validate()
  })

  const unsubscribeValidation = state.sourceData.subscribe(() => {
    validate()
  })

  const unsubscribeUpdates = state.data.subscribe(() => {
    const { onUpdate } = get(state.props)
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
      onUpdate?.(get(state.data))
    }
  })

  const destroy = (): void => {
    const { initialData } = get(state.props)

    unsubscribePropsObserver()
    unsubscribeValidation()
    unsubscribeUpdates()

    get(state.domListeners).forEach(([element, eventName, listener]) => {
      element.removeEventListener(eventName, listener)
    })
    state.domListeners.set([])

    state.fieldsElements.set({})

    state.sourceData.set(Object.freeze(initialData) as Data)
    state.isTouched.set(false)
    state.touches.set(Object.freeze({}))
  }

  const formManager = Object.freeze({
    isValid: state.isValid,
    data: state.data,
    errors: state.errors,
    touches: state.touches,
    isTouched: state.isTouched,
    update,
    reset,
    destroy,
    setData,
    useFormElement,
    useFieldElement
  })

  return formManager
}

export { createIvvyManager }
