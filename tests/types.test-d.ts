import { test } from 'vitest'
import { createIvvyManager } from '../'

test('Manager should accept only records', () => {
  createIvvyManager<{ name: string }>({
    initialData: {
      name: ''
    },
    validators: {
      name: () => true
    }
  })
  // @ts-expect-error test
  createIvvyManager<'abc'>({
    initialData: {
      name: ''
    },
    validators: {
      name: () => true
    }
  })
})
