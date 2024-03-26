import { test, expect } from '@playwright/experimental-ct-svelte'
import Component from './Initials.svelte'

test('should be initially is untouched', async ({ mount }) => {
  const component = await mount(Component)
  await expect(component.locator('[data-stat-istouched]')).toHaveText('touched: no')
})

test('should be initially validated', async ({ mount }) => {
  const component = await mount(Component)
  await expect(component.locator('[data-stat-isvalid]')).toHaveText('valid: no')
})

test('should not show invalid field error if untouched', async ({ mount }) => {
  const component = await mount(Component)
  const error = component.locator('[data-name="email"] [data-error]')
  await expect(error).toHaveText('')
})

test('should set initial value to input text field', async ({ mount }) => {
  const component = await mount(Component)
  const field = component.locator('[data-name="fullName"] input')
  await expect(field).toHaveValue('Ivvy')
})

test('should set initial value to input email field', async ({ mount }) => {
  const component = await mount(Component)
  const field = component.locator('[data-name="email"] input')
  await expect(field).toHaveValue('ivvy@example')
})

test('should set initial value to input number field', async ({ mount }) => {
  const component = await mount(Component)
  const field = component.locator('[data-name="age"] input')
  await expect(field).toHaveValue('10')
})

test('should set initial value to select field', async ({ mount }) => {
  const component = await mount(Component)
  const field = component.locator('[data-name="profession"] select')
  await expect(field).toHaveValue('musician')
})

test('should set initial value to textarea field', async ({ mount }) => {
  const component = await mount(Component)
  const field = component.locator('[data-name="bio"] textarea')
  await expect(field).toHaveValue('A basic description...')
})

test('should set initial value to radio field', async ({ mount }) => {
  const component = await mount(Component)
  await expect(component.locator('[data-name="sex"] input[value="female"]')).toBeChecked()
  await expect(component.locator('[data-name="sex"] input[value="male"]')).not.toBeChecked()
})

test('should set initial value to checkbox field', async ({ mount }) => {
  const component = await mount(Component)
  const field = component.locator('[data-name="is_married"] input')
  await expect(field).toBeChecked()
})

test('should set initial value to multiple checkboxs field', async ({ mount }) => {
  const component = await mount(Component)
  await expect(
    component.locator('[data-name="favourite_pets"] input[value="dogs"]')
  ).not.toBeChecked()
  await expect(component.locator('[data-name="favourite_pets"] input[value="cats"]')).toBeChecked()
  await expect(
    component.locator('[data-name="favourite_pets"] input[value="parrots"]')
  ).not.toBeChecked()
  await expect(
    component.locator('[data-name="favourite_pets"] input[value="cows"]')
  ).not.toBeChecked()
})
