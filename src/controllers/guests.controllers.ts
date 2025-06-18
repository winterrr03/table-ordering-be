import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { ManagerRoom, Role } from '~/constants/types'
import guestService from '~/services/guests.services'
import { TokenPayload } from '~/types/jwt.types'
import { LogoutBodyType, RefreshTokenBodyType, RefreshTokenResType } from '~/validations/auth.validations'
import { MessageResType } from '~/validations/common.validations'
import {
  GuestCreateOrdersBodyType,
  GuestCreateOrdersResType,
  GuestGetOrdersParamsType,
  GuestGetOrdersResType,
  GuestInfoResType,
  GuestLoginBodyType,
  GuestLoginResType
} from '~/validations/guests.validations'

export const guestLoginController = async (
  req: Request<ParamsDictionary, any, GuestLoginBodyType>,
  res: Response<GuestLoginResType>
) => {
  const result = await guestService.guestLogin(req.body)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Đăng nhập thành công',
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
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
    }
  })
}

export const guestLogoutController = async (
  req: Request<ParamsDictionary, any, LogoutBodyType>,
  res: Response<MessageResType>
) => {
  const { refreshToken } = req.body
  const message = await guestService.guestLogout(refreshToken)
  return res.status(HTTP_STATUS.OK).json({ message })
}

export const guestRefreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenBodyType>,
  res: Response<RefreshTokenResType>
) => {
  const { refreshToken } = req.body
  const result = await guestService.guestRefreshToken(refreshToken)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Lấy token mới thành công',
    data: result
  })
}

export const guestCreateOrdersController = async (
  req: Request<ParamsDictionary, any, GuestCreateOrdersBodyType>,
  res: Response<GuestCreateOrdersResType>
) => {
  const result = await guestService.guestCreateOrders(req.body)
  req.app.get('io').to(ManagerRoom).emit('new-order', result)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Đặt món thành công',
    data: result as GuestCreateOrdersResType['data']
  })
}

export const guestGetOrdersController = async (
  req: Request<GuestGetOrdersParamsType & ParamsDictionary>,
  res: Response<GuestGetOrdersResType>
) => {
  const result = await guestService.guestGetOrders(req.params.guest_session_id)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Lấy danh sách đơn hàng thành công',
    data: result as GuestGetOrdersResType['data']
  })
}

export const guestInfoController = async (req: Request<ParamsDictionary>, res: Response<GuestInfoResType>) => {
  const guest_id = req.decodedAccessToken.userId
  const guest = await guestService.guestInfo(guest_id)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Lấy thông tin khách hàng thành công',
    data: {
      ...guest,
      _id: guest._id.toString()
    } as GuestInfoResType['data']
  })
}
