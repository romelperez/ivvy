<script>
  import { UserForm } from './UserForm'
  import { createFormManager } from './Initials'

  let isFormSubmitting = false

  const formManager = createFormManager()
</script>

<UserForm {isFormSubmitting} {formManager} />
