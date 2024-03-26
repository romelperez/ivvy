import type { IvvyFieldElement } from '../types.js'

const setFieldElementValue = (elements: IvvyFieldElement[], value: unknown): void => {
  for (const element of elements) {
    const isInput = element instanceof HTMLInputElement
    const isInputCheckbox = isInput && element.type === 'checkbox'
    const isInputRadio = isInput && element.type === 'radio'
    const isInputFile = isInput && element.type === 'file'
    const isSelect = element instanceof HTMLSelectElement
    const isSelectMultiple = isSelect && typeof element.getAttribute('multiple') === 'string'
    const isFormElement =
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement

    if (isInputCheckbox) {
      // Boolean checkbox.
      if (typeof value === 'boolean') {
        element.checked = value
      }
      // String array checkbox.
      else if (typeof element.value === 'string' && element.value.length) {
        // The check is on the element "value" attribute.
        element.checked = Array.isArray(value) ? value.includes(element.value) : false
      }
    }
    //
    else if (isInputRadio) {
      element.checked = element.value === value
    }
    //
    else if (isSelectMultiple) {
      const options = element.querySelectorAll('option')
      const isValueAnArray = Array.isArray(value)

      for (const option of options) {
        option.selected = isValueAnArray ? value.includes(option.value) : false
      }
    }
    //
    else if (!isInputFile && isFormElement) {
      if (typeof value === 'string' || Number.isFinite(value)) {
        element.value = String(value)
      } else if (value === undefined || value === null) {
        element.value = ''
      }
    }
  }
}

export { setFieldElementValue }
