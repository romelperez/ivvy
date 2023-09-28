<script>
  import { UserForm } from './UserForm'
  import { createFormManager } from './Errors'

  let isFormSubmitting = false

  const formManager = createFormManager()
</script>

<UserForm {isFormSubmitting} {formManager} />
