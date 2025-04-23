import { ObjectId, WithId } from 'mongodb'
import envConfig from '~/config'
import HTTP_STATUS from '~/constants/httpStatus'
import { DishStatus, OrderStatus, Role, TableStatus } from '~/constants/types'
import DishSnapshot from '~/models/DishSnapshot.models'
import Guest from '~/models/Guest.models'
import GuestSession from '~/models/GuestSession.models'
import Order from '~/models/Order.models'
import databaseService from '~/services/database.services'
import { TokenPayload } from '~/types/jwt.types'
import { AuthError, StatusError } from '~/utils/errors'
import { unixTimestampToDate } from '~/utils/helpers'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '~/utils/jwt'
import { GuestCreateOrdersBodyType, GuestLoginBodyType } from '~/validations/guests.validations'

class GuestService {
  async guestLogin(body: GuestLoginBodyType) {
    const table = await databaseService.tables.findOne({
      number: body.tableNumber,
      token: body.token
    })
    if (!table) {
      throw new Error('Bàn không tồn tại hoặc mã token không đúng')
    }

    if (table.status === TableStatus.Hidden) {
      throw new Error('Bàn này đã bị ẩn, hãy chọn bàn khác để đăng nhập')
    }

    if (table.status === TableStatus.Reserved) {
      throw new Error('Bàn đã được đặt trước, hãy liên hệ nhân viên để được hỗ trợ')
    }

    let guest = await databaseService.guests.findOne({ phone: body.phone })

    if (!guest) {
      const result = await databaseService.guests.insertOne(
        new Guest({
          phone: body.phone
        })
      )
      guest = (await databaseService.guests.findOne({
        _id: result.insertedId
      })) as WithId<Guest>
    }

    const accessToken = signAccessToken(
      { userId: guest!._id.toString(), role: Role.Guest },
      { expiresIn: envConfig.GUEST_ACCESS_TOKEN_EXPIRES_IN }
    )

    const refreshToken = signRefreshToken(
      { userId: guest!._id.toString(), role: Role.Guest },
      { expiresIn: envConfig.GUEST_REFRESH_TOKEN_EXPIRES_IN }
    )

    const decodedRefreshToken = verifyRefreshToken(refreshToken)
    const refreshTokenExpiresAt = unixTimestampToDate(decodedRefreshToken.exp)

    const sessionResult = await databaseService.guest_sessions.insertOne(
      new GuestSession({
        guest_id: guest!._id,
        table_id: table._id,
        refresh_token: refreshToken,
        refresh_token_exp: refreshTokenExpiresAt
      })
    )

    const guestSession = (await databaseService.guest_sessions.findOne({
      _id: sessionResult.insertedId
    })) as WithId<GuestSession>

    return {
      guest,
      guestSession,
      accessToken,
      refreshToken
    }
  }

  async guestLogout(refreshToken: string) {
    let decodedRefreshToken: TokenPayload
    try {
      decodedRefreshToken = verifyRefreshToken(refreshToken)
    } catch (error) {
      throw new AuthError('Refresh token không hợp lệ')
    }
    await databaseService.guest_sessions.updateOne(
      { guest_id: new ObjectId(decodedRefreshToken.userId), refresh_token: refreshToken },
      {
        $set: {
          refresh_token: ''
        }
      }
    )
    return 'Đăng xuất thành công'
  }

  async guestRefreshToken(refreshToken: string) {
    let decodedRefreshToken: TokenPayload
    try {
      decodedRefreshToken = verifyRefreshToken(refreshToken)
    } catch (error) {
      throw new AuthError('Refresh token không hợp lệ')
    }
    const session = await databaseService.guest_sessions.findOne({
      refresh_token: refreshToken
    })
    if (!session) {
      throw new StatusError({ message: 'Refresh token không tồn tại', status: HTTP_STATUS.NOT_FOUND })
    }
    const newAccessToken = signAccessToken(
      {
        userId: decodedRefreshToken.userId,
        role: Role.Guest
      },
      {
        expiresIn: envConfig.GUEST_ACCESS_TOKEN_EXPIRES_IN
      }
    )
    const newRefreshToken = signRefreshToken({
      userId: decodedRefreshToken.userId,
      role: Role.Guest,
      exp: decodedRefreshToken.exp
    })
    await databaseService.guest_sessions.updateOne(
      {
        guest_id: new ObjectId(decodedRefreshToken.userId),
        refresh_token: refreshToken
      },
      {
        $set: {
          refresh_token: newRefreshToken,
          refresh_token_exp: unixTimestampToDate(decodedRefreshToken.exp)
        }
      }
    )
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }
  }

  async getOrdersWithDetail({
    guestSessionId,
    orderId,
    orderIds,
    fromDate,
    toDate
  }: {
    guestSessionId?: string
    orderId?: string
    orderIds?: string[]
    fromDate?: Date
    toDate?: Date
  }) {
    const matchStage: any = {}

    if (guestSessionId) {
      matchStage.guest_session_id = new ObjectId(guestSessionId)
    }

    if (orderId) {
      matchStage._id = new ObjectId(orderId)
    }

    if (orderIds && orderIds.length > 0) {
      matchStage._id = { $in: orderIds.map((id) => new ObjectId(id)) }
    }

    if (fromDate || toDate) {
      matchStage.created_at = {}
      if (fromDate) matchStage.created_at.$gte = new Date(fromDate)
      if (toDate) matchStage.created_at.$lte = new Date(toDate)
    }

    const fullOrders = await databaseService.orders
      .aggregate([
        { $match: matchStage },
        {
          $addFields: {
            order_handler_id: {
              $cond: [
                {
                  $and: [
                    {
                      $ne: ['$order_handler_id', null]
                    },
                    {
                      $ne: ['$order_handler_id', '']
                    }
                  ]
                },
                {
                  $toObjectId: '$order_handler_id'
                },
                null
              ]
            }
          }
        },
        {
          $lookup: {
            from: 'dish_snapshots',
            localField: 'dish_snapshot_id',
            foreignField: '_id',
            as: 'dish_snapshot'
          }
        },
        { $unwind: '$dish_snapshot' },
        {
          $lookup: {
            from: 'guest_sessions',
            localField: 'guest_session_id',
            foreignField: '_id',
            as: 'guest_session'
          }
        },
        { $unwind: { path: '$guest_session', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'guests',
            localField: 'guest_session.guest_id',
            foreignField: '_id',
            as: 'guest_session.guest'
          }
        },
        { $unwind: { path: '$guest_session.guest', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'tables',
            localField: 'guest_session.table_id',
            foreignField: '_id',
            as: 'guest_session.table'
          }
        },
        { $unwind: { path: '$guest_session.table', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'accounts',
            localField: 'order_handler_id',
            foreignField: '_id',
            as: 'order_handler'
          }
        },
        { $unwind: { path: '$order_handler', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            guest_session_id: 1,
            dish_snapshot_id: 1,
            quantity: 1,
            order_handler_id: 1,
            status: 1,
            created_at: 1,
            updated_at: 1,
            dish_snapshot: 1,
            order_handler: 1,
            guest_session: {
              _id: '$guest_session._id',
              guest_id: '$guest_session.guest_id',
              table_id: '$guest_session.table_id',
              created_at: '$guest_session.created_at',
              updated_at: '$guest_session.updated_at',
              guest: '$guest_session.guest',
              table: '$guest_session.table'
            }
          }
        },
        { $sort: { created_at: -1 } }
      ])
      .toArray()

    return fullOrders
  }

  async guestCreateOrders(body: GuestCreateOrdersBodyType) {
    const session = databaseService.client.startSession()
    try {
      const guestSessionObjectId = new ObjectId(body.guest_session_id)
      await session.withTransaction(async () => {
        const guestSession = await databaseService.guest_sessions.findOne({ _id: guestSessionObjectId }, { session })
        if (!guestSession) {
          throw new StatusError({ message: 'Không tìm thấy phiên', status: HTTP_STATUS.NOT_FOUND })
        }

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

        if (table.status === TableStatus.Hidden) {
          throw new Error(`Bàn ${table.number} đã bị ẩn, vui lòng đăng xuất và chọn bàn khác`)
        }
        if (table.status === TableStatus.Reserved) {
          throw new Error(`Bàn ${table.number} đã được đặt trước, vui lòng đăng xuất và chọn bàn khác`)
        }

        for (const item of body.orders) {
          const dish = await databaseService.dishes.findOne({ _id: new ObjectId(item.dish_id) }, { session })
          if (!dish) throw new StatusError({ message: 'Không tìm thấy món', status: HTTP_STATUS.NOT_FOUND })

          if (dish.status === DishStatus.Unavailable) throw new Error(`Món ${dish.name} đã hết`)
          if (dish.status === DishStatus.Hidden) throw new Error(`Món ${dish.name} không thể đặt`)

          const dishSnapshot = {
            dish_id: dish._id,
            name: dish.name,
            price: dish.price,
            description: dish.description,
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
            status: OrderStatus.Pending
          }

          await databaseService.orders.insertOne(new Order(order), { session })
        }
      })

      const fullOrders = await this.getOrdersWithDetail({ guestSessionId: body.guest_session_id })

      return fullOrders
    } catch (err: any) {
      throw new Error(err.message)
    } finally {
      await session.endSession()
    }
  }

  async guestGetOrders(guest_session_id: string) {
    const fullOrders = this.getOrdersWithDetail({ guestSessionId: guest_session_id })
    return fullOrders
  }
}

const guestService = new GuestService()
export default guestService
