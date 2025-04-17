import HTTP_STATUS from '~/constants/httpStatus'
import RefreshToken from '~/models/RefreshToken.models'
import databaseService from '~/services/database.services'
import { RoleType, TokenPayload } from '~/types/jwt.types'
import { AuthError, EntityError, StatusError } from '~/utils/errors'
import { comparePassword } from '~/utils/hashing'
import { unixTimestampToDate } from '~/utils/helpers'
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

    const { password: passwordUser, created_at, updated_at, ...safeAccount } = account

    return {
      account: safeAccount,
      accessToken,
      refreshToken
    }
  }

  async logout(refreshToken: string) {
    await databaseService.refresh_tokens.deleteOne({ token: refreshToken })
    return 'Đăng xuất thành công'
  }

  async refresh_token(refreshToken: string) {
    let decodedRefreshToken: TokenPayload
    try {
      decodedRefreshToken = verifyRefreshToken(refreshToken)
    } catch (error) {
      throw new AuthError('Refresh token không hợp lệ')
    }
    const refreshTokenDoc = await databaseService.refresh_tokens.findOne({
      token: refreshToken
    })
    if (!refreshTokenDoc) {
      throw new StatusError({ message: 'Refresh token không tồn tại', status: HTTP_STATUS.NOT_FOUND })
    }
    const account = await databaseService.accounts.findOne({
      _id: refreshTokenDoc.account_id
    })
    if (!account) {
      throw new StatusError({ message: 'Tài khoản không tồn tại', status: HTTP_STATUS.NOT_FOUND })
    }
    const newAccessToken = signAccessToken({
      userId: account._id.toString(),
      role: account.role as RoleType
    })
    const newRefreshToken = signRefreshToken({
      userId: account._id.toString(),
      role: account.role as RoleType,
      exp: decodedRefreshToken.exp
    })
    await databaseService.refresh_tokens.deleteOne({
      token: refreshToken
    })
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({
        token: newRefreshToken,
        account_id: account._id,
        expires_at: refreshTokenDoc.expires_at
      })
    )
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }
  }
}

const authService = new AuthService()
export default authService
