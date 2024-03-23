<script>
  import { UserForm } from '../__forms__/UserForm'
  import { createFormManager } from './SetData'

  let isFormSubmitting = false

  const formManager = createFormManager()

  const onUpdateData = () => {
    formManager.setData({
      fullName: 'Form',
      email: 'form@example.com',
      age: 12,
      profession: 'dancer',
      bio: 'No bio.',
      is_married: false,
      sex: 'male',
      favourite_pets: ['parrots', 'cows']
    })
  }
</script>

<UserForm {isFormSubmitting} {formManager} />

<button id="update-data" on:click={onUpdateData}>Update Data</button>
