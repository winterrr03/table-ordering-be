/* eslint-disable @typescript-eslint/no-unused-vars */
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import databaseService from '~/services/database.services'
import { StatusError } from '~/utils/errors'
import { UpdateMeBodyType } from '~/validations/accounts.validations'

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
        $set: body
      }
    )
    const account = await this.getMe(accountId)
    return account
  }
}

const accountService = new AccountService()
export default accountService
