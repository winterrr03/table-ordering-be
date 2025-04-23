import { Request, Response } from 'express'
import { ParamsDictionary, Query } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { Role } from '~/constants/types'
import accountService from '~/services/accounts.services'
import {
  AccountIdParamType,
  AccountListResType,
  AccountResType,
  ChangePasswordBodyType,
  ChangePasswordV2BodyType,
  ChangePasswordV2ResType,
  CreateEmployeeAccountBodyType,
  CreateGuestBodyType,
  CreateGuestResType,
  GetGuestListQueryParamsType,
  GetListGuestsResType,
  UpdateEmployeeAccountBodyType,
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

export const getAccountListController = async (req: Request<ParamsDictionary>, res: Response<AccountListResType>) => {
  const accounts = await accountService.getAccountList()
  return res.status(HTTP_STATUS.OK).json({
    message: 'Lấy danh sách nhân viên thành công',
    data: accounts as AccountListResType['data']
  })
}

export const getEmployeeAccountController = async (
  req: Request<AccountIdParamType & ParamsDictionary>,
  res: Response<AccountResType>
) => {
  const account = await accountService.getEmployeeAccount(req.params.id)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Lấy thông tin nhân viên thành công',
    data: {
      ...account,
      _id: account._id.toString()
    } as AccountResType['data']
  })
}

export const createEmployeeAccountController = async (
  req: Request<ParamsDictionary, any, CreateEmployeeAccountBodyType>,
  res: Response<AccountResType>
) => {
  const account = await accountService.createEmployeeAccount(req.body)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Tạo tài khoản thành công',
    data: {
      ...account,
      _id: account._id.toString()
    } as AccountResType['data']
  })
}

export const updateEmployeeAccountController = async (
  req: Request<AccountIdParamType & ParamsDictionary, any, UpdateEmployeeAccountBodyType>,
  res: Response<AccountResType>
) => {
  const accountId = req.params.id
  const body = req.body
  const { account, socketId, isChangeRole } = await accountService.updateEmployeeAccount(accountId, body)
  if (isChangeRole && socketId) {
    req.app.get('io').to(socketId).emit('refresh-token', account)
  }
  return res.status(HTTP_STATUS.OK).json({
    message: 'Cập nhật thành công',
    data: {
      ...account,
      _id: account._id.toString()
    } as AccountResType['data']
  })
}

export const deleteEmployeeAccountController = async (
  req: Request<AccountIdParamType & ParamsDictionary>,
  res: Response<AccountResType>
) => {
  const accountId = req.params.id
  const { account, socketId } = await accountService.deleteEmployeeAccount(accountId)
  if (socketId) {
    req.app.get('io').to(socketId).emit('logout', account)
  }
  return res.status(HTTP_STATUS.OK).json({
    message: 'Xóa thành công',
    data: {
      ...account,
      _id: account._id.toString()
    } as AccountResType['data']
  })
}

export const getGuestListController = async (
  req: Request<ParamsDictionary, any, any, Query>,
  res: Response<GetListGuestsResType>
) => {
  const { fromDate, toDate } = req.query as unknown as GetGuestListQueryParamsType
  const result = await accountService.getGuestList({ fromDate, toDate })
  return res.status(HTTP_STATUS.OK).json({
    message: 'Lấy danh sách khách thành công',
    data: result as GetListGuestsResType['data']
  })
}

export const createGuestController = async (
  req: Request<ParamsDictionary, any, CreateGuestBodyType>,
  res: Response<CreateGuestResType>
) => {
  const result = await accountService.createGuest(req.body)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Tạo tài khoản khách thành công',
    data: {
      guest: {
        ...result.guest,
        _id: result.guest._id.toString(),
        role: Role.Guest
      },
      guestSession: {
        ...result.guestSession,
        _id: result.guestSession._id.toString(),
        guest_id: result.guestSession.guest_id.toString(),
        table_id: result.guestSession.table_id.toString()
      }
    } as CreateGuestResType['data']
  })
}
