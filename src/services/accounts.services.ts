/* eslint-disable @typescript-eslint/no-unused-vars */
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import databaseService from '~/services/database.services'
import { StatusError } from '~/utils/errors'

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
}

const accountService = new AccountService()
export default accountService
