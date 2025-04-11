import HTTP_STATUS from '~/constants/httpStatus'

export class EntityError extends Error {
  fields: { message: string; field: string }[]
  status: number = HTTP_STATUS.UNPROCESSABLE_ENTITY
  constructor(fields: { message: string; field: string }[]) {
    super('Lỗi xác thực dữ liệu')
    this.fields = fields
  }
}

export class AuthError extends Error {
  status: number = HTTP_STATUS.UNAUTHORIZED
  constructor(message: string) {
    super(message)
  }
}

export class ForbiddenError extends Error {
  status: number = HTTP_STATUS.FORBIDDEN
  constructor(message: string) {
    super(message)
  }
}

export class StatusError extends Error {
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    super(message)
    this.status = status
  }
}
