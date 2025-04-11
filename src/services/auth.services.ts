import RefreshToken from '~/models/refreshToken.models'
import databaseService from '~/services/database.services'
import { RoleType } from '~/types/jwt.types'
import { EntityError } from '~/utils/errors'
import { comparePassword } from '~/utils/hashing'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '~/utils/jwt'

class AuthService {
  async login({ email, password }: { email: string; password: string }) {
    const account = await databaseService.accounts.findOne({
      email
    })
    if (!account) {
      throw new EntityError([{ field: 'email', message: 'Email không tồn tại' }])
    }
    const isPasswordMatch = await comparePassword(password, account.password)
    if (!isPasswordMatch) {
      throw new EntityError([{ field: 'password', message: 'Email hoặc mật khẩu không đúng' }])
    }
    const accessToken = signAccessToken({
      userId: account._id,
      role: account.role as RoleType
    })
    const refreshToken = signRefreshToken({
      userId: account._id,
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: passwordUser, created_at, updated_at, ...safeAccount } = account

    return {
      account: safeAccount,
      accessToken,
      refreshToken
    }
  }
}

const authService = new AuthService()
export default authService
