import z from 'zod'
import { DishStatusValues, DishTypeValues } from '~/constants/types'

export const CreateDishBody = z.object({
  name: z.string().min(1).max(256),
  price: z.coerce.number().positive(),
  description: z.string().max(10000),
  image: z.string().url(),
  type: z.enum(DishTypeValues).optional(),
  status: z.enum(DishStatusValues).optional()
})

export type CreateDishBodyType = z.TypeOf<typeof CreateDishBody>

export const DishSchema = z.object({
  _id: z.string(),
  name: z.string(),
  price: z.coerce.number(),
  description: z.string(),
  image: z.string(),
  status: z.enum(DishStatusValues),
  type: z.enum(DishTypeValues),
  created_at: z.date(),
  updated_at: z.date()
})

export const DishRes = z.object({
  data: DishSchema,
  message: z.string()
})

export type DishResType = z.TypeOf<typeof DishRes>

export const DishListRes = z.object({
  data: z.array(DishSchema),
  message: z.string()
})

export type DishListResType = z.TypeOf<typeof DishListRes>

export const UpdateDishBody = CreateDishBody
export type UpdateDishBodyType = CreateDishBodyType

export const DishParams = z.object({
  id: z.string()
})

export type DishParamsType = z.TypeOf<typeof DishParams>

export const DishListWithPaginationQuery = z.object({
  page: z.coerce.number().positive().lte(10000).default(1),
  limit: z.coerce.number().positive().lte(10000).default(100),
  type: z.string()
})

export type DishListWithPaginationQueryType = z.TypeOf<typeof DishListWithPaginationQuery>

export const DishListWithPaginationRes = z.object({
  data: z.object({
    totalItem: z.number(),
    totalPage: z.number(),
    page: z.number(),
    limit: z.number(),
    items: z.array(DishSchema)
  }),
  message: z.string()
})

export type DishListWithPaginationResType = z.TypeOf<typeof DishListWithPaginationRes>

export const DishSnapshotSchema = z.object({
  _id: z.string(),
  name: z.string(),
  price: z.number(),
  image: z.string(),
  description: z.string(),
  status: z.enum(DishStatusValues),
  type: z.enum(DishTypeValues),
  dish_id: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date()
})
