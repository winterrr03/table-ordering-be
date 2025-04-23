import { Request, Response } from 'express'
import { ParamsDictionary, Query } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { ManagerRoom } from '~/constants/types'
import orderService from '~/services/orders.services'
import {
  CreateOrdersBodyType,
  CreateOrdersResType,
  GetOrderDetailResType,
  GetOrdersQueryParamsType,
  GetOrdersResType,
  OrderParamsType,
  PayGuestOrdersBodyType,
  PayGuestOrdersResType,
  UpdateOrderBodyType,
  UpdateOrderResType
} from '~/validations/orders.validations'

export const getOrdersController = async (
  req: Request<ParamsDictionary, any, any, Query>,
  res: Response<GetOrdersResType>
) => {
  const { fromDate, toDate } = req.query as unknown as GetOrdersQueryParamsType
  const orders = await orderService.getOrdersFilter({
    fromDate,
    toDate
  })
  return res.status(HTTP_STATUS.OK).json({
    message: 'Lấy danh sách đơn hàng thành công',
    data: orders as GetOrdersResType['data']
  })
}

export const getOrderDetailController = async (
  req: Request<OrderParamsType & ParamsDictionary>,
  res: Response<GetOrderDetailResType>
) => {
  const order = await orderService.getOrderDetail(req.params.id)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Lấy đơn hàng thành công',
    data: order as GetOrderDetailResType['data']
  })
}

export const createOrdersController = async (
  req: Request<ParamsDictionary, any, CreateOrdersBodyType>,
  res: Response<CreateOrdersResType>
) => {
  const { orders, socketId } = await orderService.createOrder(req.decodedAccessToken.userId, req.body)
  if (socketId) {
    req.app.get('io').to(ManagerRoom).to(socketId).emit('new-order', orders)
  } else {
    req.app.get('io').to(ManagerRoom).emit('new-order', orders)
  }
  return res.status(HTTP_STATUS.OK).json({
    message: `Tạo thành công ${orders.length} đơn hàng cho khách hàng`,
    data: orders as CreateOrdersResType['data']
  })
}

export const updateOrderController = async (
  req: Request<OrderParamsType & ParamsDictionary, any, UpdateOrderBodyType>,
  res: Response<UpdateOrderResType>
) => {
  const result = await orderService.updateOrder(req.params.id, {
    ...req.body,
    orderHandlerId: req.decodedAccessToken.userId
  })
  if (result.socketId) {
    req.app.get('io').to(result.socketId).to(ManagerRoom).emit('update-order', result.order)
  } else {
    req.app.get('io').to(ManagerRoom).emit('update-order', result.order)
  }
  return res.status(HTTP_STATUS.OK).json({
    message: 'Cập nhật đơn hàng thành công',
    data: result.order as UpdateOrderResType['data']
  })
}

export const payOrdersController = async (
  req: Request<ParamsDictionary, any, PayGuestOrdersBodyType>,
  res: Response<PayGuestOrdersResType>
) => {
  const result = await orderService.payOrders(req.body.guest_session_id, req.decodedAccessToken.userId)
  if (result.socketId) {
    req.app.get('io').to(result.socketId).to(ManagerRoom).emit('payment', result.orders)
  } else {
    req.app.get('io').to(ManagerRoom).emit('payment', result.orders)
  }
  return res.status(HTTP_STATUS.OK).json({
    message: `Thanh toán thành công ${result.orders.length} đơn`,
    data: result.orders as PayGuestOrdersResType['data']
  })
}
