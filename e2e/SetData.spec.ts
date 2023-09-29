import { test, expect } from '@playwright/experimental-ct-svelte'
import Component from './SetData.svelte'

test.use({ viewport: { width: 1000, height: 500 } })

test('should be able to set form data dynamically', async ({ mount }) => {
  const component = await mount(Component)
  await component.locator('#update-data').click()
  await expect(component.locator('[data-name="fullName"] input')).toHaveValue('Form')
  await expect(component.locator('[data-name="email"] input')).toHaveValue('form@example.com')
  await expect(component.locator('[data-name="age"] input')).toHaveValue('12')
  await expect(component.locator('[data-name="profession"] select')).toHaveValue('dancer')
  await expect(component.locator('[data-name="bio"] textarea')).toHaveValue('No bio.')
  await expect(component.locator('[data-name="is_married"] input')).not.toBeChecked()
  await expect(component.locator('input[name="sex"][value="female"]')).not.toBeChecked()
  await expect(component.locator('input[name="sex"][value="male"]')).toBeChecked()
  await expect(component.locator('input[name="favourite_pets"][value="dogs"]')).not.toBeChecked()
  await expect(component.locator('input[name="favourite_pets"][value="cats"]')).not.toBeChecked()
  await expect(component.locator('input[name="favourite_pets"][value="parrots"]')).toBeChecked()
  await expect(component.locator('input[name="favourite_pets"][value="cows"]')).toBeChecked()
})
