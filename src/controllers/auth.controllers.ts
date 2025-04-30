import { Request, Response } from 'express'
import { ParamsDictionary, Query } from 'express-serve-static-core'
import queryString from 'query-string'
import envConfig from '~/config'
import HTTP_STATUS from '~/constants/httpStatus'
import authService from '~/services/auth.services'
import {
  LoginBodyType,
  LoginGoogleQueryType,
  LoginResType,
  LogoutBodyType,
  RefreshTokenBodyType,
  RefreshTokenResType
} from '~/validations/auth.validations'
import { MessageResType } from '~/validations/common.validations'

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginBodyType>,
  res: Response<LoginResType>
) => {
  const { email, password } = req.body
  const { account, accessToken, refreshToken } = await authService.login({ email, password })
  return res.status(HTTP_STATUS.OK).json({
    message: 'Đăng nhập thành công',
    data: {
      account: {
        ...account,
        _id: account._id.toString()
      } as LoginResType['data']['account'],
      accessToken,
      refreshToken
    }
  })
}

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutBodyType>,
  res: Response<MessageResType>
) => {
  const { refreshToken } = req.body
  const message = await authService.logout(refreshToken)
  return res.status(HTTP_STATUS.OK).json({
    message
  })
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenBodyType>,
  res: Response<RefreshTokenResType>
) => {
  const { refreshToken } = req.body
  const result = await authService.refresh_token(refreshToken)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Lấy token mới thành công',
    data: result
  })
}

export const loginGoogleController = async (req: Request<ParamsDictionary, any, any, Query>, res: Response) => {
  try {
    const { code } = req.query as unknown as LoginGoogleQueryType
    const { accessToken, refreshToken } = await authService.loginGoogle(code)
    const qs = queryString.stringify({
      accessToken,
      refreshToken,
      status: HTTP_STATUS.OK
    })
    return res.redirect(`${envConfig.GOOGLE_REDIRECT_CLIENT_URL}?${qs}`)
  } catch (error: any) {
    const { message = 'Lỗi không xác định', status = HTTP_STATUS.INTERNAL_SERVER_ERROR } = error
    const qs = queryString.stringify({
      message,
      status
    })
    return res.redirect(`${envConfig.GOOGLE_REDIRECT_CLIENT_URL}?${qs}`)
  }
}
