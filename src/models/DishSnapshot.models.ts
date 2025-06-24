import { ObjectId } from 'mongodb'
import { DishStatus, DishType } from '~/constants/types'

export type DishStatusType = (typeof DishStatus)[keyof typeof DishStatus]
export type DishTypeType = (typeof DishType)[keyof typeof DishType]

interface DishSnapshotType {
  _id?: ObjectId
  name: string
  price: number
  description: string
  image: string
  type?: DishTypeType
  status?: DishStatusType
  dish_id: ObjectId
  created_at?: Date
  updated_at?: Date
}

export default class DishSnapshot {
  _id?: ObjectId
  name: string
  price: number
  description: string
  image: string
  type: DishTypeType
  status: DishStatusType
  dish_id: ObjectId
  created_at: Date
  updated_at: Date

  constructor({
    _id,
    name,
    price,
    description,
    image,
    type,
    status,
    dish_id,
    created_at,
    updated_at
  }: DishSnapshotType) {
    const date = new Date()
    this._id = _id
    this.name = name
    this.price = price
    this.description = description
    this.image = image
    this.type = type || 'Food'
    this.status = status || 'Available'
    this.dish_id = dish_id
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}
