import { ObjectId, WithId } from 'mongodb'
import envConfig from '~/config'
import HTTP_STATUS from '~/constants/httpStatus'
import { Role, TableStatus } from '~/constants/types'
import Guest from '~/models/Guest.models'
import GuestSession from '~/models/GuestSession.models'
import databaseService from '~/services/database.services'
import { TokenPayload } from '~/types/jwt.types'
import { AuthError, StatusError } from '~/utils/errors'
import { unixTimestampToDate } from '~/utils/helpers'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '~/utils/jwt'
import { GuestLoginBodyType } from '~/validations/guests.validations'

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
}

const guestService = new GuestService()
export default guestService
