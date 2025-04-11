/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction, RequestHandler } from 'express'

export const wrapRequestHandler = <P = any>(
  func: (req: Request<P>, res: Response, next: NextFunction) => Promise<any>
): RequestHandler<P> => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
