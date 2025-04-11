import { Request, Response, NextFunction, RequestHandler } from 'express'
import { ZodSchema } from 'zod'

type ZodSchemas = {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
  headers?: ZodSchema
}

export const validate = (schemas: ZodSchemas): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        const result = schemas.body.safeParse(req.body)
        if (!result.success) throw result.error
        req.body = result.data
      }

      if (schemas.query) {
        const result = schemas.query.safeParse(req.query)
        if (!result.success) throw result.error
        req.query = result.data
      }

      if (schemas.params) {
        const result = schemas.params.safeParse(req.params)
        if (!result.success) throw result.error
        req.params = result.data
      }

      if (schemas.headers) {
        const result = schemas.headers.safeParse(req.headers)
        if (!result.success) throw result.error
        req.headers = result.data
      }

      return next()
    } catch (err) {
      return next(err)
    }
  }
}
