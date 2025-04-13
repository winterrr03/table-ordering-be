/* eslint-disable @typescript-eslint/no-unused-vars */
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import RefreshToken from '~/models/RefreshToken.models'
import databaseService from '~/services/database.services'
import { RoleType } from '~/types/jwt.types'
import { EntityError, StatusError } from '~/utils/errors'
import { comparePassword, hashPassword } from '~/utils/hashing'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '~/utils/jwt'
import { ChangePasswordBodyType, ChangePasswordV2BodyType, UpdateMeBodyType } from '~/validations/accounts.validations'

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
    const refreshTokenExpiresAt = new Date(decodedRefreshToken.exp * 1000)
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
}

const accountService = new AccountService()
export default accountService
