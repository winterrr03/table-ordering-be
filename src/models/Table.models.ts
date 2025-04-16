import { ObjectId } from 'mongodb'
import { TableStatus } from '~/constants/types'

export type TableStatusType = (typeof TableStatus)[keyof typeof TableStatus]

interface TableType {
  _id?: ObjectId
  number: number
  capacity: number
  status?: TableStatusType
  token: string
  created_at?: Date
  updated_at?: Date
}

export default class Table {
  _id?: ObjectId
  number: number
  capacity: number
  status: TableStatusType
  token: string
  created_at: Date
  updated_at: Date

  constructor({ _id, number, capacity, status, token, created_at, updated_at }: TableType) {
    const date = new Date()
    this._id = _id
    this.number = number
    this.capacity = capacity
    this.status = status || 'Hidden'
    this.token = token
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}
