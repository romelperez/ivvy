import { test, expect } from '@playwright/experimental-ct-svelte'
import Component from './Errors.svelte'

test('should form be touched if form is submitted', async ({ mount }) => {
  const component = await mount(Component)
  await component.locator('button').click()
  await expect(component.locator('[data-stat-istouched]')).toHaveText('touched: yes')
})

test('should form not allow to submit if any fields are invalid', async ({ mount }) => {
  const component = await mount(Component)
  await component.locator('button').click()
  await expect(component.locator('[data-stat-submitted]')).toHaveText('submitted: no')
})

test('should form allow to submit if fields are valid', async ({ mount }) => {
  const component = await mount(Component)
  await component.locator('[data-name="email"] input').fill('ivvy@example.com')
  await component.locator('[data-name="age"] input').fill('21')
  await component.locator('[data-name="favourite_pets"] input[value="dogs"]').check()
  await component.locator('button').click()
  await expect(component.locator('[data-stat-submitted]')).toHaveText('submitted: yes')
})

test('should field not show error if touched and valid', async ({ mount }) => {
  const component = await mount(Component)
  await component.locator('button').click()
  await expect(component.locator('[data-name="fullName"] [data-error]')).toHaveText('')
})

test('should field show error if touched and field updated from valid to invalid', async ({
  mount
}) => {
  const component = await mount(Component)
  await component.locator('[data-name="fullName"] input').fill('')
  await component.locator('[data-name="fullName"] input').blur()
  await expect(component.locator('[data-name="fullName"] [data-error]')).toHaveText(
    'This field should not be empty.'
  )
})

test('should field show error if touched and invalid field', async ({ mount }) => {
  const component = await mount(Component)
  await component.locator('button').click()
  await expect(component.locator('[data-name="email"] [data-error]')).toHaveText(
    'A valid email address is required.'
  )
})

test('should field not show error if touched and field updated from invalid to valid', async ({
  mount
}) => {
  const component = await mount(Component)
  await component.locator('[data-name="email"] input').fill('ivvy@example.com')
  await component.locator('[data-name="email"] input').blur()
  await expect(component.locator('[data-name="email"] [data-error]')).toHaveText('')
})
