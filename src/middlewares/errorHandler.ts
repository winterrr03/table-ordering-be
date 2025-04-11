/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express'
import { AuthError, EntityError, ForbiddenError, StatusError } from '~/utils/errors'
import { ZodError } from 'zod'

const isZodError = (error: any): error is ZodError => {
  if (error instanceof ZodError) {
    return true
  }
  return false
}

const isEntityError = (error: any): error is EntityError => {
  if (error instanceof EntityError) {
    return true
  }
  return false
}

const isAuthError = (error: any): error is AuthError => {
  if (error instanceof AuthError) {
    return true
  }
  return false
}

const isForbiddenError = (error: any): error is ForbiddenError => {
  if (error instanceof ForbiddenError) {
    return true
  }
  return false
}

const isStatusError = (error: any): error is StatusError => {
  if (error instanceof StatusError) {
    return true
  }
  return false
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  try {
    if (isEntityError(err)) {
      return res.status(err.status).json({
        message: 'Lỗi xảy ra khi xác thực dữ liệu.',
        errors: err.fields,
        statusCode: err.status
      })
    } else if (isForbiddenError(err)) {
      return res.status(err.status).json({
        message: err.message,
        statusCode: err.status
      })
    } else if (isAuthError(err)) {
      return res
        .cookie('session_token', '', {
          path: '/',
          httpOnly: true,
          sameSite: 'none',
          secure: true
        })
        .status(err.status)
        .json({
          message: err.message,
          statusCode: err.status
        })
    } else if (isStatusError(err)) {
      return res.status(err.status).json({
        message: err.message,
        statusCode: err.status
      })
    } else if (isZodError(err)) {
      const errors = err.issues.map((issue) => ({
        ...issue,
        field: issue.path.join('.')
      }))
      const statusCode = 422
      return res.status(statusCode).json({
        message: 'Đã xảy ra lỗi xác thực.',
        errors,
        statusCode
      })
    } else {
      const statusCode = (err as any).statusCode || 400
      return res.status(statusCode).json({
        message: err.message,
        errors: err,
        statusCode
      })
    }
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi máy chủ nội bộ.',
      errors: error
    })
  }
}
