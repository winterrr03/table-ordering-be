import z from 'zod'
import { Role } from '~/constants/types'

export const strongPassword = z.string().refine(
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
      'Mật khẩu phải dài từ 8 đến 100 ký tự, chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường, một chữ số và một ký tự đặc biệt.'
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

export const LogoutBody = z
  .object({
    refreshToken: z.string()
  })
  .strict()

export type LogoutBodyType = z.TypeOf<typeof LogoutBody>

export const RefreshTokenBody = z
  .object({
    refreshToken: z.string()
  })
  .strict()

export type RefreshTokenBodyType = z.TypeOf<typeof RefreshTokenBody>

export const RefreshTokenRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string()
  }),
  message: z.string()
})

export type RefreshTokenResType = z.TypeOf<typeof RefreshTokenRes>

export const LoginGoogleQuery = z.object({
  code: z.string()
})

export type LoginGoogleQueryType = z.TypeOf<typeof LoginGoogleQuery>
