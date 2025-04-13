/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import accountService from '~/services/accounts.services'
import {
  AccountResType,
  ChangePasswordBodyType,
  ChangePasswordV2BodyType,
  ChangePasswordV2ResType,
  UpdateMeBodyType
} from '~/validations/accounts.validations'

export const getMeController = async (req: Request<ParamsDictionary>, res: Response<AccountResType>) => {
  const accountId = req.decodedAccessToken.userId
  const account = await accountService.getMe(accountId)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Lấy thông tin thành công',
    data: {
      ...account,
      _id: account._id.toString()
    } as AccountResType['data']
  })
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeBodyType>,
  res: Response<AccountResType>
) => {
  const accountId = req.decodedAccessToken.userId
  const account = await accountService.updateMe(accountId, req.body)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Cập nhật thông tin thành công',
    data: {
      ...account,
      _id: account._id.toString()
    } as AccountResType['data']
  })
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordBodyType>,
  res: Response<AccountResType>
) => {
  const accountId = req.decodedAccessToken.userId
  const account = await accountService.changePassword(accountId, req.body)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Đổi mật khẩu thành công',
    data: {
      ...account,
      _id: account._id.toString()
    } as AccountResType['data']
  })
}

export const changePasswordV2Controller = async (
  req: Request<ParamsDictionary, any, ChangePasswordV2BodyType>,
  res: Response<ChangePasswordV2ResType>
) => {
  const accountId = req.decodedAccessToken.userId
  const { account: rawAccount, accessToken, refreshToken } = await accountService.changePasswordV2(accountId, req.body)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Đổi mật khẩu thành công',
    data: {
      account: {
        ...rawAccount,
        _id: rawAccount._id.toString()
      },
      accessToken,
      refreshToken
    } as ChangePasswordV2ResType['data']
  })
}
