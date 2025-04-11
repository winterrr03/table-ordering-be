/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import authService from '~/services/auth.services'
import { LoginBodyType, LoginResType } from '~/validations/auth.validations'

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginBodyType>,
  res: Response<LoginResType>
) => {
  const { email, password } = req.body
  const { account, accessToken, refreshToken } = await authService.login({ email, password })
  return res.status(200).json({
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
