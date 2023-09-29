<script>
  import { UserForm } from './UserForm'
  import { createFormManager } from './Formatters'

  let isFormSubmitting = false

  const formManager = createFormManager()
</script>

<UserForm {isFormSubmitting} {formManager} />
