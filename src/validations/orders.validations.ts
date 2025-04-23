import z from 'zod'
import { OrderStatusValues } from '~/constants/types'
import { AccountSchema } from '~/validations/accounts.validations'
import { DishSnapshotSchema } from '~/validations/dishses.validations'
import { TableSchema } from '~/validations/tables.validations'

export const OrderSchema = z.object({
  _id: z.string(),
  guest_session_id: z.string().nullable(),
  guest_session: z
    .object({
      _id: z.string(),
      guest_id: z.string(),
      guest: z.object({
        _id: z.string(),
        phone: z.string(),
        score: z.number(),
        created_at: z.date(),
        updated_at: z.date()
      }),
      table_id: z.string().nullable(),
      table: TableSchema,
      created_at: z.date(),
      updated_at: z.date()
    })
    .nullable(),
  dish_snapshot_id: z.string(),
  dish_snapshot: DishSnapshotSchema,
  quantity: z.number(),
  order_handler_id: z.string().nullable(),
  order_handler: AccountSchema.nullable(),
  status: z.enum(OrderStatusValues),
  created_at: z.date(),
  updated_at: z.date()
})

export const OrderParams = z.object({
  id: z.string()
})

export type OrderParamsType = z.TypeOf<typeof OrderParams>

export const CreateOrdersBody = z
  .object({
    guest_session_id: z.string(),
    orders: z.array(
      z.object({
        dish_id: z.string(),
        quantity: z.number()
      })
    )
  })
  .strict()

export type CreateOrdersBodyType = z.TypeOf<typeof CreateOrdersBody>

export const CreateOrdersRes = z.object({
  message: z.string(),
  data: z.array(OrderSchema)
})

export type CreateOrdersResType = z.TypeOf<typeof CreateOrdersRes>

export const UpdateOrderBody = z.object({
  status: z.enum(OrderStatusValues),
  dish_id: z.string(),
  quantity: z.number()
})

export type UpdateOrderBodyType = z.TypeOf<typeof UpdateOrderBody>

export const UpdateOrderRes = z.object({
  message: z.string(),
  data: OrderSchema
})

export type UpdateOrderResType = z.TypeOf<typeof UpdateOrderRes>

export const GetOrdersQueryParams = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional()
})

export type GetOrdersQueryParamsType = z.TypeOf<typeof GetOrdersQueryParams>

export const GetOrdersRes = z.object({
  message: z.string(),
  data: z.array(OrderSchema)
})

export type GetOrdersResType = z.TypeOf<typeof GetOrdersRes>

export const GetOrderDetailRes = z.object({
  message: z.string(),
  data: OrderSchema
})

export type GetOrderDetailResType = z.TypeOf<typeof GetOrderDetailRes>

export const PayGuestOrdersBody = z.object({
  guest_session_id: z.string()
})

export type PayGuestOrdersBodyType = z.TypeOf<typeof PayGuestOrdersBody>

export const PayGuestOrdersRes = GetOrdersRes

export type PayGuestOrdersResType = z.TypeOf<typeof PayGuestOrdersRes>
