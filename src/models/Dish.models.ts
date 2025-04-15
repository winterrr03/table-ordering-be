import { ObjectId } from 'mongodb'
import { DishStatus } from '~/constants/types'

export type DishStatusType = (typeof DishStatus)[keyof typeof DishStatus]

interface DishType {
  _id?: ObjectId
  name: string
  price: number
  description: string
  image: string
  status?: DishStatusType
  created_at?: Date
  updated_at?: Date
}

export default class Dish {
  _id?: ObjectId
  name: string
  price: number
  description: string
  image: string
  status: DishStatusType
  created_at: Date
  updated_at: Date

  constructor({ _id, name, price, description, image, status, created_at, updated_at }: DishType) {
    const date = new Date()
    this._id = _id
    this.name = name
    this.price = price
    this.description = description
    this.image = image
    this.status = status || 'Hidden'
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}
