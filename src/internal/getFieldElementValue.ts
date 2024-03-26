import type { IvvyFieldElement, IvvyFieldValue } from '../types.js'

const getFieldElementValue = (
  element: IvvyFieldElement,
  valueCurrent?: unknown
): IvvyFieldValue => {
  const isInput = element instanceof HTMLInputElement
  const isInputCheckbox = isInput && element.type === 'checkbox'
  const isInputNumber = isInput && element.type === 'number'
  const isInputFile = isInput && element.type === 'file'
  const isSelect = element instanceof HTMLSelectElement
  const isSelectMultiple = isSelect && typeof element.getAttribute('multiple') === 'string'

  let value: IvvyFieldValue = element.value

  if (isInputCheckbox) {
    // Get the actual HTML attribute value.
    // `element.value` will provide a calculated value which might be different.
    const inputCheckboxValue = element.getAttribute('value')

    // String array checkbox.
    if (typeof inputCheckboxValue === 'string' && inputCheckboxValue.length) {
      value = Array.isArray(valueCurrent) ? [...valueCurrent] : []

      if (element.checked) {
        value = Array.from(new Set([...(value as string[]), inputCheckboxValue]))
      } else {
        value = (value as string[]).filter((item) => item !== inputCheckboxValue)
      }
    }
    // Boolean checkbox.
    else {
      value = element.checked
    }
  }
  //
  else if (isSelectMultiple) {
    const options = Array.from(element.querySelectorAll('option'))
    value = options.filter((option) => option.selected).map((option) => option.value)
  }
  //
  else if (isInputNumber) {
    value = element.valueAsNumber
  }
  //
  else if (isInputFile) {
    value = Array.from(element.files ?? [])
  }

  return value
}

export { getFieldElementValue }
