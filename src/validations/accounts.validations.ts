import z from 'zod'
import { Role } from '~/constants/types'
import { LoginRes, strongPassword } from '~/validations/auth.validations'

export const AccountSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum([Role.Owner, Role.Employee]),
  avatar: z.string().nullable()
})

export type AccountType = z.TypeOf<typeof AccountSchema>

export const AccountRes = z
  .object({
    data: AccountSchema,
    message: z.string()
  })
  .strict()

export type AccountResType = z.TypeOf<typeof AccountRes>

export const UpdateMeBody = z
  .object({
    name: z.string().trim().min(2).max(256),
    avatar: z.string().url().optional()
  })
  .strict()

export type UpdateMeBodyType = z.TypeOf<typeof UpdateMeBody>

export const ChangePasswordBody = z
  .object({
    oldPassword: z.string().min(8).max(100),
    password: strongPassword,
    confirmPassword: z.string().min(8).max(100)
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Mật khẩu mới không khớp',
        path: ['confirmPassword']
      })
    }
  })

export type ChangePasswordBodyType = z.TypeOf<typeof ChangePasswordBody>

export const ChangePasswordV2Body = ChangePasswordBody

export type ChangePasswordV2BodyType = z.TypeOf<typeof ChangePasswordV2Body>

export const ChangePasswordV2Res = LoginRes

export type ChangePasswordV2ResType = z.TypeOf<typeof ChangePasswordV2Res>
