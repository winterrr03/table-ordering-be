import z from 'zod'
import { Role } from '~/constants/types'

const strongPassword = z.string().refine(
  (val) => {
    return (
      val.length >= 8 &&
      val.length <= 100 &&
      /[A-Z]/.test(val) &&
      /[a-z]/.test(val) &&
      /\d/.test(val) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(val)
    )
  },
  {
    message:
      'Password must be between 8 and 100 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
  }
)

export const LoginBody = z
  .object({
    email: z.string().email(),
    password: strongPassword
  })
  .strict()

export type LoginBodyType = z.TypeOf<typeof LoginBody>

export const LoginRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    account: z.object({
      _id: z.string(),
      name: z.string(),
      email: z.string(),
      role: z.enum([Role.Owner, Role.Employee]),
      avatar: z.string().nullable()
    })
  }),
  message: z.string()
})

export type LoginResType = z.TypeOf<typeof LoginRes>
