import { ObjectId, WithId } from 'mongodb'
import envConfig from '~/config'
import HTTP_STATUS from '~/constants/httpStatus'
import { Role, TableStatus } from '~/constants/types'
import Account from '~/models/Account.models'
import Guest from '~/models/Guest.models'
import GuestSession from '~/models/GuestSession.models'
import RefreshToken from '~/models/RefreshToken.models'
import databaseService from '~/services/database.services'
import { RoleType } from '~/types/jwt.types'
import { EntityError, StatusError } from '~/utils/errors'
import { comparePassword, hashPassword } from '~/utils/hashing'
import { unixTimestampToDate } from '~/utils/helpers'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '~/utils/jwt'
import {
  ChangePasswordBodyType,
  ChangePasswordV2BodyType,
  CreateEmployeeAccountBodyType,
  CreateGuestBodyType,
  UpdateEmployeeAccountBodyType,
  UpdateMeBodyType
} from '~/validations/accounts.validations'

class AccountService {
  async getMe(accountId: string) {
    const account = await databaseService.accounts.findOne({
      _id: new ObjectId(accountId)
    })
    if (!account) {
      throw new StatusError({ message: 'Tài khoản không tồn tại', status: HTTP_STATUS.NOT_FOUND })
    }
    const { password: passwordUser, created_at, updated_at, ...safeAccount } = account
    return safeAccount
  }

  async updateMe(accountId: string, body: UpdateMeBodyType) {
    await databaseService.accounts.updateOne(
      {
        _id: new ObjectId(accountId)
      },
      {
        $set: {
          ...body,
          updated_at: new Date()
        }
      }
    )
    const account = await this.getMe(accountId)
    return account
  }

  async changePassword(accountId: string, body: ChangePasswordBodyType) {
    const account = await databaseService.accounts.findOne({
      _id: new ObjectId(accountId)
    })
    if (!account) {
      throw new StatusError({ message: 'Tài khoản không tồn tại', status: HTTP_STATUS.NOT_FOUND })
    }
    const isSame = await comparePassword(body.oldPassword, account.password)
    if (!isSame) {
      throw new EntityError([{ field: 'oldPassword', message: 'Mật khẩu cũ không đúng' }])
    }
    const hashedPassword = await hashPassword(body.password)
    await databaseService.accounts.updateOne(
      {
        _id: new ObjectId(accountId)
      },
      {
        $set: {
          password: hashedPassword,
          updated_at: new Date()
        }
      }
    )
    const newAccount = await this.getMe(accountId)
    return newAccount
  }

  async changePasswordV2(accountId: string, body: ChangePasswordV2BodyType) {
    const account = await this.changePassword(accountId, body)
    await databaseService.refresh_tokens.deleteMany({
      account_id: new ObjectId(accountId)
    })
    const accessToken = signAccessToken({
      userId: account._id.toString(),
      role: account.role as RoleType
    })
    const refreshToken = signRefreshToken({
      userId: account._id.toString(),
      role: account.role as RoleType
    })
    const decodedRefreshToken = verifyRefreshToken(refreshToken)
    const refreshTokenExpiresAt = unixTimestampToDate(decodedRefreshToken.exp)
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({
        token: refreshToken,
        account_id: account._id,
        expires_at: refreshTokenExpiresAt
      })
    )
    return {
      account,
      accessToken,
      refreshToken
    }
  }

  async getAccountList() {
    const accounts = await databaseService.accounts
      .aggregate([
        {
          $sort: { created_at: -1 }
        },
        {
          $project: {
            _id: { $toString: '$_id' },
            name: 1,
            email: 1,
            role: 1,
            avatar: 1
          }
        }
      ])
      .toArray()
    return accounts
  }

  async getEmployeeAccount(accountId: string) {
    const account = await databaseService.accounts.findOne({
      _id: new ObjectId(accountId)
    })
    if (!account) {
      throw new StatusError({ message: 'Tài khoản không tồn tại', status: HTTP_STATUS.NOT_FOUND })
    }
    const { password: passwordUser, created_at, updated_at, ...safeAccount } = account
    return safeAccount
  }

  async createEmployeeAccount(body: CreateEmployeeAccountBodyType) {
    const existAccount = await databaseService.accounts.findOne({
      email: body.email
    })
    if (existAccount) {
      throw new EntityError([{ field: 'email', message: 'Email đã tồn tại' }])
    }
    const hashedPassword = await hashPassword(body.password)
    const result = await databaseService.accounts.insertOne(
      new Account({
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: Role.Employee,
        avatar: body.avatar
      })
    )
    const account = (await databaseService.accounts.findOne({
      _id: result.insertedId
    })) as WithId<Account>
    const { password: passwordUser, created_at, updated_at, ...safeAccount } = account
    return safeAccount
  }

  async updateEmployeeAccount(accountId: string, body: UpdateEmployeeAccountBodyType) {
    const [socketRecord, oldAccount] = await Promise.all([
      databaseService.sockets.findOne({
        account_id: accountId
      }),
      databaseService.accounts.findOne({
        _id: new ObjectId(accountId)
      })
    ])
    if (!oldAccount) {
      throw new EntityError([{ field: 'email', message: 'Tài khoản bạn đang cập nhật không còn tồn tại nữa!' }])
    }
    const existAccount = await databaseService.accounts.findOne({
      email: body.email
    })
    if (existAccount && existAccount._id.toString() !== accountId) {
      throw new EntityError([{ field: 'email', message: 'Email đã tồn tại' }])
    }
    const isChangeRole = oldAccount.role !== body.role
    const updateData: any = {
      name: body.name,
      email: body.email,
      avatar: body.avatar,
      role: body.role,
      updated_at: new Date()
    }
    if (body.changePassword) {
      const hashedPassword = await hashPassword(body.password!)
      updateData.password = hashedPassword
    }
    await databaseService.accounts.updateOne({ _id: new ObjectId(accountId) }, { $set: updateData })
    const account = (await databaseService.accounts.findOne({
      _id: new ObjectId(accountId)
    })) as WithId<Account>
    const { password: passwordUser, created_at, updated_at, ...safeAccount } = account
    return { account: safeAccount, socketId: socketRecord?.socket_id, isChangeRole }
  }

  async deleteEmployeeAccount(accountId: string) {
    const account = await databaseService.accounts.findOne({
      _id: new ObjectId(accountId)
    })
    if (!account) {
      throw new StatusError({ message: 'Tài khoản không tồn tại hoặc đã bị xóa', status: HTTP_STATUS.NOT_FOUND })
    }
    await databaseService.accounts.deleteOne({
      _id: new ObjectId(accountId)
    })
    const socketRecord = await databaseService.sockets.findOne({
      account_id: accountId
    })
    return {
      account,
      socketId: socketRecord?.socket_id
    }
  }

  async getGuestList({ fromDate, toDate }: { fromDate?: Date; toDate?: Date }) {
    const filter: any = {}

    if (fromDate || toDate) {
      filter.created_at = {}
      if (fromDate) filter.created_at.$gte = fromDate
      if (toDate) filter.created_at.$lte = toDate
    }

    const guests = await databaseService.guests.find(filter).sort({ created_at: -1 }).toArray()
    const mappedGuests = guests.map((guest) => ({
      ...guest,
      _id: guest._id.toString()
    }))

    return mappedGuests
  }

  async createGuest(body: CreateGuestBodyType) {
    const table = await databaseService.tables.findOne({
      number: body.tableNumber
    })

    if (!table) {
      throw new Error('Bàn không tồn tại')
    }

    if (table.status === TableStatus.Hidden) {
      throw new Error('Bàn này đã bị ẩn, hãy chọn bàn khác để đăng nhập')
    }

    const result = await databaseService.guests.insertOne(
      new Guest({
        phone: body.phone
      })
    )

    const guest = (await databaseService.guests.findOne({
      _id: result.insertedId
    })) as WithId<Guest>

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
      guestSession
    }
  }
}

const accountService = new AccountService()
export default accountService
