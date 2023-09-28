<script>
  import { createIvvyManager } from '../../'
  import { schema } from './schema'
  import { translations } from './translations'
  import UserForm from './UserForm.svelte'

  let isFormSubmitting = false

  const formManager = createIvvyManager({
    preventSubmit: 'always',
    initialData: {
      fullName: 'Ivvy',
      email: 'ivvy@example',
      age: 10,
      profession: 'musician',
      bio: 'A basic description...',
      sex: null,
      is_married: true,
      favourite_pets: ['cats']
    },
    formatters: {
      age: (value) => (isNaN(Number(value)) ? null : Number(value))
    },
    validators: schema.shape,
    locale: 'en',
    translations,
    onSubmit (data) {
      console.log('data', data)

      isFormSubmitting = true

      setTimeout(() => {
        isFormSubmitting = false
        formManager.reset()
      }, 1000)
    }
  })
</script>

<UserForm {isFormSubmitting} {formManager} />
