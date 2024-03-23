import type { IvvyManagerFieldElement } from '../types.js'

const setFieldElementValue = <Data extends Record<string, unknown>>(
  name: keyof Data,
  elements: IvvyManagerFieldElement[],
  value: unknown
): void => {
  elements.forEach((element) => {
    const isInputCheckbox = element instanceof HTMLInputElement && element.type === 'checkbox'
    const isInputRadio = element instanceof HTMLInputElement && element.type === 'radio'
    const isInputFile = element instanceof HTMLInputElement && element.type === 'file'

    const isFormElement =
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement

    // Input checkbox.
    if (isInputCheckbox) {
      // Boolean checkbox.
      if (typeof value === 'boolean') {
        element.checked = value
      }
      else if (typeof element.value === 'string' && element.value.length) {
        // String array checkbox.
        // The check is on the element "value" attribute.
        element.checked = Array.isArray(value) ? value.includes(element.value) : false
      }
    }
    else if (isInputRadio) {
      element.checked = element.value === value
    }
    else if (!isInputFile && isFormElement) {
      if (typeof value === 'string' || Number.isFinite(value)) {
        element.value = String(value)
      }
      else if (value === undefined || value === null) {
        element.value = ''
      }
    }
  })
}

export { setFieldElementValue }
