import z from 'zod'
import { DishSchema } from '~/validations/dishses.validations'

export const DashboardIndicatorQueryParams = z.object({
  fromDate: z.coerce.date(),
  toDate: z.coerce.date()
})

export type DashboardIndicatorQueryParamsType = z.TypeOf<typeof DashboardIndicatorQueryParams>

export const DashboardIndicatorRes = z.object({
  data: z.object({
    revenue: z.number(),
    guestCount: z.number(),
    orderCount: z.number(),
    servingTableCount: z.number(),
    dishIndicator: z.array(
      DishSchema.extend({
        successOrders: z.number()
      })
    ),
    revenueByDate: z.array(
      z.object({
        date: z.string(),
        revenue: z.number()
      })
    )
  }),
  message: z.string()
})

export type DashboardIndicatorResType = z.TypeOf<typeof DashboardIndicatorRes>

export const AspectSentimentIndicatorSchema = z.object({
  aspect: z.string(),
  review_count: z.number(),
  sentiments: z.array(
    z.object({
      sentiment: z.enum(['positive', 'neutral', 'negative']),
      percentage: z.number().min(0).max(100)
    })
  )
})

export const AspectSentimentIndicatorRes = z.object({
  data: z.array(AspectSentimentIndicatorSchema),
  message: z.string()
})

export type AspectSentimentIndicatorResType = z.TypeOf<typeof AspectSentimentIndicatorRes>

export const aspectItemSchema = z.object({
  _id: z.string(),
  text: z.string(),
  aspects: z.array(
    z.object({
      aspect: z.string(),
      sentiment: z.enum(['positive', 'negative', 'neutral']),
      confidence: z.number().min(0).max(1)
    })
  ),
  created_at: z.date(),
  updated_at: z.date()
})

export const reviewWithAspectsRes = z.object({
  data: z.array(aspectItemSchema),
  message: z.string()
})

export type reviewWithAspectsResType = z.TypeOf<typeof reviewWithAspectsRes>
