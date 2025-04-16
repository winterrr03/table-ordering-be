import { ObjectId, WithId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import Table from '~/models/Table.models'
import databaseService from '~/services/database.services'
import { EntityError, StatusError } from '~/utils/errors'
import { randomId } from '~/utils/helpers'
import { CreateTableBodyType, UpdateTableBodyType } from '~/validations/tables.validations'

class TableService {
  async getTableList() {
    const tables = await databaseService.tables
      .aggregate([
        {
          $addFields: {
            _id: { $toString: '$_id' }
          }
        },
        {
          $sort: { created_at: -1 }
        }
      ])
      .toArray()
    return tables
  }

  async getTableDetail(tableId: string) {
    const table = await databaseService.tables.findOne({ _id: new ObjectId(tableId) })
    if (!table) {
      throw new StatusError({ message: 'Bàn ăn không tồn tại', status: HTTP_STATUS.NOT_FOUND })
    }
    return table
  }

  async createTable(body: CreateTableBodyType) {
    const existTable = await databaseService.tables.findOne({
      number: body.number
    })
    if (existTable) {
      throw new EntityError([
        {
          message: 'Số bàn này đã tồn tại',
          field: 'number'
        }
      ])
    }
    const token = randomId()
    const result = await databaseService.tables.insertOne(
      new Table({
        number: body.number,
        capacity: body.capacity,
        status: body.status,
        token
      })
    )
    const table = (await databaseService.tables.findOne({
      _id: result.insertedId
    })) as WithId<Table>
    return table
  }

  async updateTable(tableId: string, body: UpdateTableBodyType) {
    const existTable = await databaseService.tables.findOne({ _id: new ObjectId(tableId) })
    if (!existTable) {
      throw new StatusError({ message: 'Bàn ăn không tồn tại', status: HTTP_STATUS.NOT_FOUND })
    }
    const updateData: any = {
      status: body.status,
      capacity: body.capacity,
      updated_at: new Date()
    }
    if (body.changeToken) {
      updateData.token = randomId()
    }
    await databaseService.tables.updateOne(
      {
        _id: new ObjectId(tableId)
      },
      {
        $set: updateData
      }
    )
    const table = (await databaseService.tables.findOne({
      _id: new ObjectId(tableId)
    })) as WithId<Table>
    return table
  }

  async deleteTable(tableId: string) {
    const table = await databaseService.tables.findOne({ _id: new ObjectId(tableId) })
    if (!table) {
      throw new StatusError({ message: 'Bàn ăn không tồn tại', status: HTTP_STATUS.NOT_FOUND })
    }
    await databaseService.tables.deleteOne({
      _id: new ObjectId(tableId)
    })
    return table
  }
}

const tableService = new TableService()
export default tableService
