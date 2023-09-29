import { test, expect } from '@playwright/experimental-ct-svelte'
import Component from './Formatters.svelte'

test.use({ viewport: { width: 1000, height: 500 } })

test('should allow to format values after input changes', async ({ mount }) => {
  const component = await mount(Component)

  await component.locator('[name="fullName"]').fill('Ivvy')
  await component.locator('[name="fullName"]').blur()
  await component.locator('[name="age"]').fill('21')
  await component.locator('[name="age"]').blur()
  const data1 = JSON.stringify({
    fullName: 'IVVY',
    email: null,
    age: 21,
    profession: null,
    bio: null,
    sex: null,
    is_married: null,
    favourite_pets: null
  })
  await expect(component.locator('[data-stat-data]')).toHaveText(`data: ${data1}`)

  await component.locator('[name="fullName"]').fill('Yrel')
  await component.locator('[name="fullName"]').blur()
  await component.locator('[name="age"]').fill('')
  await component.locator('[name="age"]').blur()
  const data2 = JSON.stringify({
    fullName: 'YREL',
    email: null,
    age: null,
    profession: null,
    bio: null,
    sex: null,
    is_married: null,
    favourite_pets: null
  })
  await expect(component.locator('[data-stat-data]')).toHaveText(`data: ${data2}`)
})
