<script>
  import { onDestroy } from 'svelte'

  export let isFormSubmitting = null
  export let formManager = null

  const {
    isValid,
    isTouched,
    data,
    touches,
    errors,
    useFormElement,
    useFieldElement
  } = formManager

  onDestroy(() => {
    formManager.destroy()
  })
</script>

<form use:useFormElement>
  <h1>User Form</h1>

  <div data-stat-istouched>touched: {$isTouched ? 'yes' : 'no'}</div>
  <div data-stat-isvalid>valid: {$isValid ? 'yes' : 'no'}</div>
  <div data-stat-submitted>submitted: no</div>
  <div data-stat-data>data: {JSON.stringify($data)}</div>

  <label data-name="fullName">
    <div data-label>Full Name:</div>
    <input
      type="text"
      name="fullName"
      disabled={isFormSubmitting}
      use:useFieldElement
    />
    <div data-error>
      {$touches.fullName && $errors.fullName?.[0] || ''}
    </div>
  </label>

  <label data-name="email">
    <div data-label>Email:</div>
    <input
      type="email"
      name="email"
      disabled={isFormSubmitting}
      use:useFieldElement
    />
    <div data-error>
      {$touches.email && $errors.email?.[0] || ''}
    </div>
  </label>

  <label data-name="age">
    <div data-label>Age:</div>
    <input
      type="number"
      name="age"
      disabled={isFormSubmitting}
      use:useFieldElement
    />
    <div data-error>
      {$touches.age && $errors.age?.[0] || ''}
    </div>
  </label>

  <label data-name="profession">
    <div data-label>Profession:</div>
    <select name="profession" disabled={isFormSubmitting} use:useFieldElement>
      <option value=""></option>
      <option value="painter">Painter</option>
      <option value="dancer">Dancer</option>
      <option value="musician">Musician</option>
      <option value="writer">Writer</option>
      <option value="performer">Performer</option>
      <option value="sculptor">Sculptor</option>
    </select>
    <div data-error>
      {$touches.profession && $errors.profession?.[0] || ''}
    </div>
  </label>

  <label data-name="bio">
    <div data-label>Bio:</div>
    <textarea
      name="bio"
      disabled={isFormSubmitting}
      use:useFieldElement
    />
    <div data-error>
      {$touches.bio && $errors.bio?.[0] || ''}
    </div>
  </label>

  <div data-name="sex">
    <div data-label>Sex:</div>
    <label>
      <div data-label>Female:</div>
      <input
        type="radio"
        name="sex"
        value="female"
        disabled={isFormSubmitting}
        use:useFieldElement
      />
    </label>
    <label>
      <div data-label>Male:</div>
      <input
        type="radio"
        name="sex"
        value="male"
        disabled={isFormSubmitting}
        use:useFieldElement
      />
    </label>
    <div data-error>
      {$touches.sex && $errors.sex?.[0] || ''}
    </div>
  </div>

  <label data-name="is_married">
    <div data-label>Marriage:</div>
    <input
      type="checkbox"
      name="is_married"
      disabled={isFormSubmitting}
      use:useFieldElement
    />
    <div data-error>
      {$touches.is_married && $errors.is_married?.[0] || ''}
    </div>
  </label>

  <div data-name="favourite_pets">
    <div data-label>Favourite Pets:</div>
    <label>
      <div data-label>Dogs:</div>
      <input
        type="checkbox"
        name="favourite_pets"
        value="dogs"
        disabled={isFormSubmitting}
        use:useFieldElement
      />
    </label>
    <label>
      <div data-label>Cats:</div>
      <input
        type="checkbox"
        name="favourite_pets"
        value="cats"
        disabled={isFormSubmitting}
        use:useFieldElement
      />
    </label>
    <label>
      <div data-label>Parrots:</div>
      <input
        type="checkbox"
        name="favourite_pets"
        value="parrots"
        disabled={isFormSubmitting}
        use:useFieldElement
      />
    </label>
    <label>
      <div data-label>Cows:</div>
      <input
        type="checkbox"
        name="favourite_pets"
        value="cows"
        disabled={isFormSubmitting}
        use:useFieldElement
      />
    </label>
    <div data-error>
      {$touches.favourite_pets && $errors.favourite_pets?.[0] || ''}
    </div>
  </div>

  <button type="submit" disabled={isFormSubmitting}>
    {#if isFormSubmitting}
      Submitting...
    {:else}
      Submit
    {/if}
  </button>
</form>
