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
  createWritable,
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
    props: createWritable(initialProps),
    domListeners: createWritable<Array<[HTMLElement, string, (event: Event) => void]>>([]),
    fieldsElements: createWritable<Partial<Record<keyof Data, IvvyFieldElement[]>>>({}),
    formElement: createWritable<HTMLFormElement | null>(null),
    sourceData: createWritable<IvvyManagerFieldsData<Data>>(
      Object.freeze(initialProps.initialData) as Data
    ),
    isValid: createWritable(false),
    data: createWritable<IvvyManagerFieldsData<Data>>(
      Object.freeze(initialProps.initialData) as Data
    ),
    errors: createWritable<IvvyManagerFieldsErrors<Data>>(Object.freeze({})),
    isTouched: createWritable(false),
    touches: createWritable<IvvyManagerFieldsTouches<Data>>(Object.freeze({}))
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

    state.props.set({ ...state.props.get(), ...propsToUpdate })
  }

  const reset = (): void => {
    const { initialData } = state.props.get()

    state.sourceData.set(Object.freeze(initialData) as Data)
    state.isTouched.set(false)
    state.touches.set(Object.freeze({}))
  }

  const setData = (newData: { [P in keyof Data]?: Data[P] | undefined | null }): void => {
    state.sourceData.set(Object.freeze({ ...state.data.get(), ...newData }))
  }

  const unsubscribePropsObserver = state.props.subscribe(() => {
    validate()
  })

  const unsubscribeValidation = state.sourceData.subscribe(() => {
    validate()
  })

  const unsubscribeUpdates = state.data.subscribe(() => {
    const { onUpdate } = state.props.get()
    const dataNew = state.data.get()
    const fieldsElementsValue = state.fieldsElements.get()
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
      onUpdate?.(state.data.get())
    }
  })

  const destroy = (): void => {
    const { initialData } = state.props.get()

    unsubscribePropsObserver()
    unsubscribeValidation()
    unsubscribeUpdates()

    state.domListeners.get().forEach(([element, eventName, listener]) => {
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
