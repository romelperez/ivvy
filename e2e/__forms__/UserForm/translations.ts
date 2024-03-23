import { type YrelErrorTranslations } from 'yrel'
import { type UktiTranslations } from 'ukti'

export const translations: UktiTranslations<YrelErrorTranslations> = {
  en: {
    err_unknown: 'This field is required.',
    err_boolean: 'This field should be a boolean.',
    err_boolean_truthy: 'This field should be checked.',
    err_number: 'A valid number is required.',
    err_number_gt: 'This number should be greater than {{gt}}.',
    err_number_gte: 'This number should be at least {{gte}}.',
    err_number_lt: 'This number should be less than {{lt}}.',
    err_number_lte: 'This number should be at most {{lte}}.',
    err_number_integer: 'This number should be a integer.',
    err_number_currency: 'A valid currency number is required.',
    err_string: 'This field is required.',
    err_string_nonempty: 'This field should not be empty.',
    err_string_trim: 'This field should not contain white spaces before or after.',
    err_string_length:
      'The field should have exactly {{length}} character{{length === 1 ? "" : "s"}}.',
    err_string_min: 'The field should have at least {{min}} character{{min === 1 ? "" : "s"}}.',
    err_string_max: 'The field should have at most {{max}} character{{max === 1 ? "" : "s"}}.',
    err_string_date_time: 'This field is required.',
    err_string_date: 'This field is required.',
    err_string_time: 'This field is required.',
    err_string_lowercase: 'Text should be in lower case.',
    err_string_uppercase: 'Text should be in upper case.',
    err_string_capitalcase: 'Text should be in capital case.',
    err_string_email: 'A valid email address is required.',
    err_string_credit_card: 'A valid credit card number is required.',
    err_string_url: 'A valid URL address is required.',
    err_string_uuid: 'This field is invalid.',
    err_literal: 'This field is required.',
    err_array: 'This field is required.',
    err_array_nonempty: 'This list should not be empty.',
    err_array_length: 'This field is required.',
    err_array_min: 'The list should have at least {{min}} items.',
    err_array_max: 'The list should have at most {{max}} items.',
    err_union: 'An option should be selected.',
    err_tuple: 'This field is required.',
    err_object: 'This field is required.',
    err_object_unexpected_props: 'This field contains unexpected data.',
    err_record: 'This field is required.',
    err_record_keys: 'This field is required.'
  }
}
