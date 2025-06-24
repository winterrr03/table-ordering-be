import { Request, Response } from 'express'
import { ParamsDictionary, Query } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import dishService from '~/services/dishes.services'
import {
  CreateDishBodyType,
  DishListResType,
  DishListWithPaginationResType,
  DishParamsType,
  DishResType,
  UpdateDishBodyType
} from '~/validations/dishses.validations'

export const getDishListController = async (req: Request<ParamsDictionary>, res: Response<DishListResType>) => {
  const dishes = await dishService.getDishList()
  return res.status(HTTP_STATUS.OK).json({
    message: 'Lấy danh sách món ăn thành công',
    data: dishes as DishListResType['data']
  })
}

export const getDishListWithPaginationController = async (
  req: Request<ParamsDictionary, any, any, Query>,
  res: Response<DishListWithPaginationResType>
) => {
  const page = Number(req.query.page)
  const limit = Number(req.query.limit)
  const type = req.query.type as string
  const dishes = await dishService.getDishListWithPagination(page, limit, type)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Lấy danh sách món ăn thành công',
    data: {
      items: dishes.items as DishListWithPaginationResType['data']['items'],
      totalItem: dishes.totalItem,
      totalPage: dishes.totalPage,
      page,
      limit
    }
  })
}

export const getDishDetailController = async (
  req: Request<DishParamsType & ParamsDictionary>,
  res: Response<DishResType>
) => {
  const dish = await dishService.getDishDetail(req.params.id)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Lấy thông tin món ăn thành công',
    data: {
      ...dish,
      _id: dish._id.toString()
    } as DishResType['data']
  })
}

export const createDishController = async (
  req: Request<ParamsDictionary, any, CreateDishBodyType>,
  res: Response<DishResType>
) => {
  const dish = await dishService.createDish(req.body)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Tạo món ăn thành công',
    data: {
      ...dish,
      _id: dish._id.toString()
    } as DishResType['data']
  })
}

export const updateDishController = async (
  req: Request<DishParamsType & ParamsDictionary, any, UpdateDishBodyType>,
  res: Response<DishResType>
) => {
  const dish = await dishService.updateDish(req.params.id, req.body)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Cập nhật món ăn thành công',
    data: {
      ...dish,
      _id: dish._id.toString()
    } as DishResType['data']
  })
}

export const deleteDishController = async (
  req: Request<DishParamsType & ParamsDictionary>,
  res: Response<DishResType>
) => {
  const dish = await dishService.deleteDish(req.params.id)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Xóa món ăn thành công',
    data: {
      ...dish,
      _id: dish._id.toString()
    } as DishResType['data']
  })
}
