import { get } from 'svelte/store'
import type { IvvyManagerProps, IvvyManagerState, IvvyManagerFieldElement } from '../types.js'
import { setFieldElementValue } from './setFieldElementValue.js'

type UseFieldElement = (element: IvvyManagerFieldElement) => void

const createUseFieldElement = <Data extends Record<string, unknown>>(
  props: IvvyManagerProps<Data>,
  state: IvvyManagerState<Data>
): UseFieldElement => {
  return (element: IvvyManagerFieldElement) => {
    const name = element.getAttribute('name') as keyof Data

    if (!Object.keys(props.initialData).includes(name as string)) {
      throw new Error(
        `The provided form element with name "${String(name)}" is not defined the initial form manager configuration.`
      )
    }

    // Save field element reference.
    const fieldsElements = get(state.fieldsElements)
    const fieldElementsCurrent = fieldsElements[name]
    const fieldElementsNew = fieldElementsCurrent ? [...fieldElementsCurrent, element] : [element]

    state.fieldsElements.update((value) => ({
      ...value,
      [name]: fieldElementsNew
    }))

    setFieldElementValue(name, fieldElementsNew, get(state.data)[name])

    const isInputCheckbox = element instanceof HTMLInputElement && element.type === 'checkbox'
    const isInputRadio = element instanceof HTMLInputElement && element.type === 'radio'
    const isInputNumber = element instanceof HTMLInputElement && element.type === 'number'
    const isInputFile = element instanceof HTMLInputElement && element.type === 'file'
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
            throw new Error(
              'If an input type checkbox has the attribute value with data, the corresponding form manager data type must be an array of strings or nullish.'
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

      const formatter = props.formatters?.[name]
      const valueNew = formatter ? formatter(valueNewRaw, get(state.data)) : valueNewRaw

      // After input file has selected some files, reset the value
      // so it can select even the same files again.
      if (props.cleanInputFileValue && isInputFile) {
        element.value = ''
      }

      state.data.update((data) => Object.freeze({ ...data, [name]: valueNew }))

      props.onUpdate?.(get(state.data))
    }

    const onDirty = (): void => {
      state.isTouched.set(true)
      state.touches.update((touches) => Object.freeze({ ...touches, [name]: true }))
    }

    // Set event listeners.

    // Checked inputs.
    if (isInputCheckbox || isInputRadio) {
      element.addEventListener('click', onUpdate)
      element.addEventListener('click', onDirty)

      state.domListeners.update((values) => [
        ...values,
        [element, 'click', onUpdate],
        [element, 'click', onDirty]
      ])
    } else if (isInputFile) {
      element.addEventListener('input', onUpdate)
      element.addEventListener('input', onDirty)

      state.domListeners.update((values) => [
        ...values,
        [element, 'input', onUpdate],
        [element, 'input', onDirty]
      ])
    } else if (isSelect) {
      element.addEventListener('change', onUpdate)
      element.addEventListener('change', onDirty)

      state.domListeners.update((values) => [
        ...values,
        [element, 'change', onUpdate],
        [element, 'change', onDirty]
      ])
    } else if (isFormElement) {
      element.addEventListener('input', onUpdate)
      element.addEventListener('change', onUpdate)
      element.addEventListener('change', onDirty)

      state.domListeners.update((values) => [
        ...values,
        [element, 'input', onUpdate],
        [element, 'change', onUpdate],
        [element, 'change', onDirty]
      ])
    }
  }
}

export type { UseFieldElement }
export { createUseFieldElement }
