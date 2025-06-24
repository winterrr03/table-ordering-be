import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { DishStatus, OrderStatus, TableStatus } from '~/constants/types'
import DishSnapshot from '~/models/DishSnapshot.models'
import Order from '~/models/Order.models'
import databaseService from '~/services/database.services'
import guestService from '~/services/guests.services'
import { StatusError } from '~/utils/errors'
import { CreateOrdersBodyType, UpdateOrderBodyType } from '~/validations/orders.validations'

class OrderService {
  async createOrder(orderHandlerId: string, body: CreateOrdersBodyType) {
    const session = databaseService.client.startSession()
    const { guest_session_id, orders } = body
    const guestSessionObjectId = new ObjectId(guest_session_id)

    const guestSession = await databaseService.guest_sessions.findOne({ _id: guestSessionObjectId })
    if (!guestSession) {
      throw new StatusError({ message: 'Không tìm thấy phiên', status: HTTP_STATUS.NOT_FOUND })
    }
    try {
      await session.withTransaction(async () => {
        const guest = await databaseService.guests.findOne({ _id: new ObjectId(guestSession.guest_id) }, { session })
        if (!guest) {
          throw new StatusError({ message: 'Không tìm thấy khách', status: HTTP_STATUS.NOT_FOUND })
        }

        const table = guestSession.table_id
          ? await databaseService.tables.findOne({ _id: new ObjectId(guestSession.table_id) }, { session })
          : null

        if (!table) {
          throw new Error('Bàn của bạn đã bị xóa, vui lòng đăng xuất và đăng nhập lại một bàn mới')
        }

        // if (table.status === TableStatus.Hidden) {
        //   throw new Error(`Bàn ${table.number} đã bị ẩn, vui lòng đăng xuất và chọn bàn khác`)
        // }
        // if (table.status === TableStatus.Reserved) {
        //   throw new Error(`Bàn ${table.number} đã được đặt trước, vui lòng đăng xuất và chọn bàn khác`)
        // }

        for (const item of orders) {
          const dish = await databaseService.dishes.findOne({ _id: new ObjectId(item.dish_id) }, { session })
          if (!dish) throw new StatusError({ message: 'Không tìm thấy món', status: HTTP_STATUS.NOT_FOUND })

          if (dish.status === DishStatus.Unavailable) throw new Error(`Món ${dish.name} đã hết`)
          if (dish.status === DishStatus.Hidden) throw new Error(`Món ${dish.name} không thể đặt`)

          const dishSnapshot = {
            dish_id: dish._id,
            name: dish.name,
            price: dish.price,
            description: dish.description,
            type: dish.type,
            image: dish.image,
            status: dish.status
          }

          const { insertedId: snapshotId } = await databaseService.dish_snapshots.insertOne(
            new DishSnapshot(dishSnapshot),
            { session }
          )

          const order = {
            guest_session_id: guestSessionObjectId,
            dish_snapshot_id: snapshotId,
            quantity: item.quantity,
            discount: item.discount,
            status: OrderStatus.Pending,
            order_handler_id: orderHandlerId
          }

          await databaseService.orders.insertOne(new Order(order), { session })
        }
      })

      const fullOrders = await guestService.getOrdersWithDetail({ guestSessionId: guest_session_id })

      const socketRecord = await databaseService.sockets.findOne({ guest_id: guestSession.guest_id.toString() })

      return {
        orders: fullOrders,
        socketId: socketRecord?.socket_id
      }
    } catch (err: any) {
      throw new Error(err.message)
    } finally {
      await session.endSession()
    }
  }

  async getOrdersFilter({ fromDate, toDate }: { fromDate?: Date; toDate?: Date }) {
    const orders = await guestService.getOrdersWithDetail({ fromDate, toDate })
    return orders
  }

  async updateOrder(orderId: string, body: UpdateOrderBodyType & { orderHandlerId: string }) {
    const { status, dish_id, quantity, orderHandlerId } = body
    const session = databaseService.client.startSession()

    try {
      await session.withTransaction(async () => {
        const orderObjectId = new ObjectId(orderId)
        const dishObjectId = new ObjectId(dish_id)

        const order = await databaseService.orders.findOne({ _id: orderObjectId }, { session })
        if (!order) throw new Error('Không tìm thấy đơn hàng')
        if (order.status === 'Paid') {
          throw new Error('Không thể cập nhật đơn hàng đã thanh toán')
        }

        const currentSnapshot = await databaseService.dish_snapshots.findOne(
          { _id: order.dish_snapshot_id },
          { session }
        )
        if (!currentSnapshot) throw new Error('Không tìm thấy snapshot hiện tại')

        let newSnapshotId = currentSnapshot._id

        if (!currentSnapshot.dish_id.equals(dishObjectId)) {
          const newDish = await databaseService.dishes.findOne({ _id: dishObjectId }, { session })
          if (!newDish) throw new Error('Không tìm thấy món ăn mới')

          const snapshotData = {
            dish_id: newDish._id,
            name: newDish.name,
            price: newDish.price,
            description: newDish.description,
            type: newDish.type,
            image: newDish.image,
            status: newDish.status
          }

          const { insertedId } = await databaseService.dish_snapshots.insertOne(new DishSnapshot(snapshotData), {
            session
          })
          newSnapshotId = insertedId
        }

        const update = {
          $set: {
            status,
            quantity,
            order_handler_id: orderHandlerId,
            dish_snapshot_id: newSnapshotId,
            updated_at: new Date()
          }
        }
        await databaseService.orders.updateOne({ _id: orderObjectId }, update, { session })
      })

      const fullOrders = await guestService.getOrdersWithDetail({ orderId })
      const updatedOrder = fullOrders[0]

      const socketRecord = await databaseService.sockets.findOne({
        guest_id: updatedOrder.guest_session.guest_id.toString()
      })

      return {
        order: fullOrders[0],
        socketId: socketRecord?.socket_id
      }
    } finally {
      await session.endSession()
    }
  }

  async getOrderDetail(orderId: string) {
    const orders = await guestService.getOrdersWithDetail({ orderId })
    return orders[0]
  }

  async payOrders(guestSessionId: string, orderHandlerId: string) {
    const guestSessionObjectId = new ObjectId(guestSessionId)
    const guestSession = await databaseService.guest_sessions.findOne({ _id: guestSessionObjectId })
    if (!guestSession) {
      throw new StatusError({ message: 'Không tìm thấy phiên', status: HTTP_STATUS.NOT_FOUND })
    }

    const session = databaseService.client.startSession()
    let updatedOrderIds: string[] = []
    try {
      await session.withTransaction(async () => {
        const orders = await databaseService.orders
          .find(
            {
              guest_session_id: guestSessionObjectId,
              status: { $in: [OrderStatus.Pending, OrderStatus.Processing, OrderStatus.Delivered] }
            },
            { session }
          )
          .toArray()

        if (orders.length === 0) {
          throw new Error('Không có hóa đơn nào cần thanh toán')
        }

        const orderIds = orders.map((order) => order._id)
        await databaseService.orders.updateMany(
          { _id: { $in: orderIds } },
          {
            $set: {
              status: OrderStatus.Paid,
              order_handler_id: orderHandlerId,
              updated_at: new Date()
            }
          },
          { session }
        )

        updatedOrderIds = orders.map((order) => order._id.toString())
      })

      const fullOrders = await guestService.getOrdersWithDetail({
        orderIds: updatedOrderIds
      })

      const socketRecord = await databaseService.sockets.findOne({ guest_id: guestSession.guest_id.toString() })

      return {
        orders: fullOrders,
        socketId: socketRecord?.socket_id
      }
    } finally {
      await session.endSession()
    }
  }
}

const orderService = new OrderService()
export default orderService
