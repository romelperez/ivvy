import { type InferYrel, y } from 'yrel'

export const schema = y.object({
  fullName: y.string().nonempty().min(2).max(20).capitalcase(),
  email: y
    .string()
    .validate((value) => /^.+@.+\..{2,3}$/.test(value) || [['err_string_email']])
    .max(64),
  age: y.number().gte(18).lte(150).nullable(),
  profession: y.union([
    y.literal('painter'),
    y.literal('dancer'),
    y.literal('musician'),
    y.literal('writer'),
    y.literal('performer'),
    y.literal('sculptor')
  ]),
  bio: y.string().max(60).nullable(),
  sex: y.union([y.literal('male'), y.literal('female')]),
  is_married: y.boolean(),
  favourite_pets: y
    .array(
      y.union([y.literal('dogs'), y.literal('cats'), y.literal('parrots'), y.literal('cows')])
    )
    .nonempty()
    .min(2)
    .max(10)
})

export type Schema = InferYrel<typeof schema>
