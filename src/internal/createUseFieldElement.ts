import { get } from 'svelte/store'
import type {
  IvvyManagerPropsInternal,
  IvvyManagerState,
  IvvyUseHookOutput,
  IvvyFieldElement
} from '../types.js'
import { getFieldElementValue } from './getFieldElementValue.js'
import { setFieldElementValue } from './setFieldElementValue.js'

const createUseFieldElement = <Data extends Record<string, unknown>>(
  props: IvvyManagerPropsInternal<Data>,
  state: IvvyManagerState<Data>
): ((element: IvvyFieldElement) => IvvyUseHookOutput) => {
  return (element) => {
    const name = element.getAttribute('name') as keyof Data

    if (!Object.keys(props.initialData).includes(name as string)) {
      throw new Error(
        `Ivvy was provided a form element with name "${String(name)}" which is not defined in the initial form manager configuration.`
      )
    }

    const dataCurrent = get(state.data)
    const fieldsElements = get(state.fieldsElements)
    const fieldElementsCurrent = fieldsElements[name]
    const fieldElementsNew = fieldElementsCurrent ? [...fieldElementsCurrent, element] : [element]

    state.fieldsElements.update((value) => ({ ...value, [name]: fieldElementsNew }))

    setFieldElementValue(fieldElementsNew, dataCurrent[name])

    const isInput = element instanceof HTMLInputElement
    const isInputCheckbox = isInput && element.type === 'checkbox'
    const isInputRadio = isInput && element.type === 'radio'
    const isInputFile = isInput && element.type === 'file'
    const isSelect = element instanceof HTMLSelectElement
    const isFormElement =
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement

    const onUpdate = (): void => {
      const data = get(state.data)
      const valueRaw = getFieldElementValue(element, data[name])

      // After input file has selected some files, reset the value
      // so it can select even the same files again.
      if (props.cleanInputFileValue && isInputFile) {
        element.value = ''
      }

      const fieldFormatter = props.formatters?.[name]
      const value = fieldFormatter ? fieldFormatter(valueRaw, data) : valueRaw

      state.sourceData.update((data) => Object.freeze({ ...data, [name]: value }))
    }

    const onTouch = (): void => {
      state.isTouched.set(true)
      state.touches.update((touches) => Object.freeze({ ...touches, [name]: true }))
    }

    const destroy = (): void => {
      state.fieldsElements.update((fieldsElements) => {
        const fieldElement = fieldsElements[name]
        fieldsElements[name] = fieldElement
          ? fieldElement.filter((item) => item !== element)
          : undefined
        return { ...fieldsElements }
      })

      state.domListeners.update((domListeners) =>
        domListeners.filter(([itemElement, eventName, listener]) => {
          if (itemElement === element) {
            element.removeEventListener(eventName, listener)
          }
          return itemElement !== element
        })
      )
    }

    if (isInputCheckbox || isInputRadio || isSelect) {
      element.addEventListener('change', onUpdate)
      element.addEventListener('change', onTouch)

      state.domListeners.update((values) => [
        ...values,
        [element, 'change', onUpdate],
        [element, 'change', onTouch]
      ])
    } else if (isInputFile) {
      element.addEventListener('input', onUpdate)
      element.addEventListener('input', onTouch)

      state.domListeners.update((values) => [
        ...values,
        [element, 'input', onUpdate],
        [element, 'input', onTouch]
      ])
    } else if (isFormElement) {
      element.addEventListener('input', onUpdate)
      element.addEventListener('change', onUpdate)
      element.addEventListener('change', onTouch)

      state.domListeners.update((values) => [
        ...values,
        [element, 'input', onUpdate],
        [element, 'change', onUpdate],
        [element, 'change', onTouch]
      ])
    }

    return { destroy }
  }
}

export { createUseFieldElement }
