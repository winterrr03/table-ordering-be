/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import accountService from '~/services/accounts.services'
import { AccountResType, UpdateMeBodyType } from '~/validations/accounts.validations'

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
