import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import authService from '~/services/auth.services'
import {
  LoginBodyType,
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
