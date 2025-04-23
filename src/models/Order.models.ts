import { ObjectId } from 'mongodb'
import { OrderStatus } from '~/constants/types'

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus]

interface OrderType {
  _id?: ObjectId
  guest_session_id: ObjectId
  dish_snapshot_id: ObjectId
  quantity: number
  order_handler_id?: string
  status?: OrderStatusType
  created_at?: Date
  updated_at?: Date
}

export default class Order {
  _id?: ObjectId
  guest_session_id: ObjectId
  dish_snapshot_id: ObjectId
  quantity: number
  order_handler_id: string
  status: OrderStatusType
  created_at: Date
  updated_at: Date

  constructor({
    _id,
    guest_session_id,
    dish_snapshot_id,
    quantity,
    order_handler_id,
    status,
    created_at,
    updated_at
  }: OrderType) {
    const date = new Date()
    this._id = _id
    this.guest_session_id = guest_session_id
    this.dish_snapshot_id = dish_snapshot_id
    this.quantity = quantity
    this.order_handler_id = order_handler_id || ''
    this.status = status || 'Pending'
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}
