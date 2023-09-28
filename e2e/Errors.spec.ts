import { test, expect } from '@playwright/experimental-ct-svelte'
import InitialsComponent from './Errors.svelte'

test.use({ viewport: { width: 1000, height: 500 } })

test('should be touched if form is submitted', async ({ mount }) => {
  const component = await mount(InitialsComponent)
  await component.locator('button').click()
  await expect(component.locator('[data-stat-istouched]')).toHaveText('touched: yes')
})

test('should not show error if touched and valid', async ({ mount }) => {
  const component = await mount(InitialsComponent)
  await component.locator('button').click()
  await expect(component.locator('[data-name="fullName"] [data-error]')).toHaveText('')
})

test('should show error if touched and updated from valid to invalid', async ({ mount }) => {
  const component = await mount(InitialsComponent)
  await component.locator('[data-name="fullName"] input').fill('')
  await component.locator('[data-name="fullName"] input').blur()
  await expect(component.locator('[data-name="fullName"] [data-error]')).toHaveText('This field should not be empty.')
})

test('should show error if touched and invalid', async ({ mount }) => {
  const component = await mount(InitialsComponent)
  await component.locator('button').click()
  await expect(component.locator('[data-name="email"] [data-error]')).toHaveText('A valid email address is required.')
})

test('should not show error if touched and updated from invalid to valid', async ({ mount }) => {
  const component = await mount(InitialsComponent)
  await component.locator('[data-name="email"] input').fill('ivvy@example.com')
  await component.locator('[data-name="email"] input').blur()
  await expect(component.locator('[data-name="email"] [data-error]')).toHaveText('')
})

test('should not allow to submit if any fields are invalid', async ({ mount }) => {
  const component = await mount(InitialsComponent)
  await component.locator('button').click()
  await expect(component.locator('[data-stat-submitted]')).toHaveText('submitted: no')
})

test('should allow to submit if fields are valid', async ({ mount }) => {
  const component = await mount(InitialsComponent)
  await component.locator('[data-name="email"] input').fill('ivvy@example.com')
  await component.locator('[data-name="age"] input').fill('21')
  await component.locator('[data-name="favourite_pets"] input[value="dogs"]').check()
  await component.locator('button').click()
  await expect(component.locator('[data-stat-submitted]')).toHaveText('submitted: yes')
})
