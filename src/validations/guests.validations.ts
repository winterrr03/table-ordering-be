import z from 'zod'
import { Role } from '~/constants/types'

const vietnamPhoneRegex = /^(03[2-9]|05[6|8|9]|07[0|6-9]|08[1-5|8]|09[0-9]|086|088|089|091|094|092|059|099)[0-9]{7}$/

export const GuestLoginBody = z
  .object({
    phone: z.string().regex(vietnamPhoneRegex, {
      message: 'Số điện thoại không hợp lệ'
    }),
    tableNumber: z.number(),
    token: z.string()
  })
  .strict()

export type GuestLoginBodyType = z.TypeOf<typeof GuestLoginBody>

export const GuestLoginRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    guest: z.object({
      _id: z.string(),
      phone: z.string(),
      score: z.number(),
      role: z.enum([Role.Guest]),
      created_at: z.date(),
      updated_at: z.date()
    }),
    guestSession: z.object({
      _id: z.string(),
      guest_id: z.string(),
      table_id: z.string(),
      refresh_token: z.string(),
      refresh_token_exp: z.date(),
      created_at: z.date(),
      updated_at: z.date()
    })
  }),
  message: z.string()
})

export type GuestLoginResType = z.TypeOf<typeof GuestLoginRes>
