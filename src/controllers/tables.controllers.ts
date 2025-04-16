import { Request, Response } from 'express'
import { ParamsDictionary, Query } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import tableService from '~/services/tables.services'
import {
  CreateTableBodyType,
  TableListResType,
  TableParamsType,
  TableResType,
  UpdateTableBodyType
} from '~/validations/tables.validations'

export const getTableListController = async (req: Request<ParamsDictionary>, res: Response<TableListResType>) => {
  const tables = await tableService.getTableList()
  return res.status(HTTP_STATUS.OK).json({
    message: 'Lấy danh sách bàn thành công',
    data: tables as TableListResType['data']
  })
}

export const getTableDetailController = async (
  req: Request<TableParamsType & ParamsDictionary>,
  res: Response<TableResType>
) => {
  const table = await tableService.getTableDetail(req.params.id)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Lấy thông tin bàn thành công',
    data: {
      ...table,
      _id: table._id.toString()
    } as TableResType['data']
  })
}

export const createTableController = async (
  req: Request<ParamsDictionary, any, CreateTableBodyType>,
  res: Response<TableResType>
) => {
  const table = await tableService.createTable(req.body)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Tạo bàn thành công',
    data: {
      ...table,
      _id: table._id.toString()
    } as TableResType['data']
  })
}

export const updateTableController = async (
  req: Request<TableParamsType & ParamsDictionary, any, UpdateTableBodyType>,
  res: Response<TableResType>
) => {
  const table = await tableService.updateTable(req.params.id, req.body)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Cập nhật bàn thành công',
    data: {
      ...table,
      _id: table._id.toString()
    } as TableResType['data']
  })
}

export const deleteTableController = async (
  req: Request<TableParamsType & ParamsDictionary>,
  res: Response<TableResType>
) => {
  const table = await tableService.deleteTable(req.params.id)
  return res.status(HTTP_STATUS.OK).json({
    message: 'Xóa bàn thành công',
    data: {
      ...table,
      _id: table._id.toString()
    } as TableResType['data']
  })
}
