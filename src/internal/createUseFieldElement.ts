import { get } from 'svelte/store'
import type {
  IvvyManagerPropsInternal,
  IvvyManagerState,
  IvvyUseHookOutput,
  IvvyManagerFieldElement
} from '../types.js'
import { setFieldElementValue } from './setFieldElementValue.js'

const createUseFieldElement = <Data extends Record<string, unknown>>(
  props: IvvyManagerPropsInternal<Data>,
  state: IvvyManagerState<Data>
): ((element: IvvyManagerFieldElement) => IvvyUseHookOutput) => {
  return (element) => {
    const name = element.getAttribute('name') as keyof Data

    if (!Object.keys(props.initialData).includes(name as string)) {
      throw new Error(
        `Ivvy was provided a form element with name "${String(name)}" which is not defined in the initial form manager configuration.`
      )
    }

    const fieldsElements = get(state.fieldsElements)
    const fieldElementsCurrent = fieldsElements[name]
    const fieldElementsNew = fieldElementsCurrent ? [...fieldElementsCurrent, element] : [element]

    state.fieldsElements.update((value) => ({ ...value, [name]: fieldElementsNew }))

    setFieldElementValue(name, fieldElementsNew, get(state.data)[name])

    const isInput = element instanceof HTMLInputElement
    const isInputCheckbox = isInput && element.type === 'checkbox'
    const isInputRadio = isInput && element.type === 'radio'
    const isInputNumber = isInput && element.type === 'number'
    const isInputFile = isInput && element.type === 'file'
    const isSelect = element instanceof HTMLSelectElement
    const isFormElement =
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement

    const onUpdate = (): void => {
      let valueNewRaw: unknown = element.value

      if (isInputCheckbox) {
        // Get the actual HTML attribute value.
        // `element.value` will provide a calculated value which might be different.
        const inputCheckboxValue = element.getAttribute('value')

        // String array checkbox.
        // If the input is checkbox and has a "value" attribute with data,
        // then this field value is of type "string[]", where if the checkbox
        // is checked, the correponding element value string will be in the array,
        // otherwise, the element value string is removed from it.
        if (typeof inputCheckboxValue === 'string' && inputCheckboxValue.length) {
          const dataFieldValueCurrent = get(state.data)[name]

          if (
            dataFieldValueCurrent !== null &&
            dataFieldValueCurrent !== undefined &&
            !Array.isArray(dataFieldValueCurrent)
          ) {
            console.error(
              'Ivvy, if an input type checkbox has the attribute value with text, the corresponding form manager data type must be an array of strings or nullish.'
            )
          }

          valueNewRaw = Array.isArray(dataFieldValueCurrent) ? [...dataFieldValueCurrent] : []

          if (element.checked) {
            valueNewRaw = Array.from(new Set([...(valueNewRaw as string[]), inputCheckboxValue]))
          } else {
            valueNewRaw = (valueNewRaw as string[]).filter((item) => item !== element.value)
          }
        } else {
          // Boolean checkbox.
          valueNewRaw = element.checked
        }
      } else if (isInputNumber) {
        valueNewRaw = element.valueAsNumber
      } else if (isInputFile) {
        valueNewRaw = Array.from(element.files ?? [])
      }

      // After input file has selected some files, reset the value
      // so it can select even the same files again.
      if (props.cleanInputFileValue && isInputFile) {
        element.value = ''
      }

      const fieldFormatter = props.formatters?.[name]
      const valueNew = fieldFormatter ? fieldFormatter(valueNewRaw, get(state.data)) : valueNewRaw

      state.sourceData.update((data) => Object.freeze({ ...data, [name]: valueNew }))
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
