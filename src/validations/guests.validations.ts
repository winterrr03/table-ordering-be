import z from 'zod'
import { vietnamPhoneRegex } from '~/constants/regex'
import { Role } from '~/constants/types'
import { OrderSchema } from '~/validations/orders.validations'

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

export const GuestCreateOrdersBody = z.object({
  guest_session_id: z.string(),
  orders: z.array(
    z.object({
      dish_id: z.string(),
      quantity: z.number()
    })
  )
})

export type GuestCreateOrdersBodyType = z.TypeOf<typeof GuestCreateOrdersBody>

export const GuestCreateOrdersRes = z.object({
  message: z.string(),
  data: z.array(OrderSchema)
})

export type GuestCreateOrdersResType = z.TypeOf<typeof GuestCreateOrdersRes>

export const GuestGetOrdersParams = z.object({
  guest_session_id: z.string()
})

export type GuestGetOrdersParamsType = z.TypeOf<typeof GuestGetOrdersParams>

export const GuestGetOrdersRes = GuestCreateOrdersRes

export type GuestGetOrdersResType = z.TypeOf<typeof GuestGetOrdersRes>
