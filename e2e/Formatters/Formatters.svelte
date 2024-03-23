<script>
  import { UserForm } from '../__forms__/UserForm'
  import { createFormManager } from './Formatters'

  let isFormSubmitting = false

  const formManager = createFormManager()
</script>

<UserForm {isFormSubmitting} {formManager} />
