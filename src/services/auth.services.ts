import axios from 'axios'
import envConfig from '~/config'
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

  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: envConfig.GOOGLE_CLIENT_ID,
      client_secret: envConfig.GOOGLE_CLIENT_SECRET,
      redirect_uri: envConfig.GOOGLE_AUTHORIZED_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as {
      access_token: string
      expires_in: number
      refresh_token: string
      scope: string
      token_type: string
      id_token: string
    }
  }

  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
    }
  }

  async loginGoogle(code: string) {
    const data = await this.getOauthGoogleToken(code)
    const { id_token, access_token } = data
    const googleUser = await this.getGoogleUserInfo(access_token, id_token)
    if (!googleUser.verified_email) {
      throw new StatusError({
        status: HTTP_STATUS.FORBIDDEN,
        message: 'Email chưa được xác minh từ Google'
      })
    }
    const account = await databaseService.accounts.findOne({
      email: googleUser.email
    })
    if (!account) {
      throw new StatusError({
        status: HTTP_STATUS.FORBIDDEN,
        message: 'Tài khoản này không tồn tại trên hệ thống'
      })
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
}

const authService = new AuthService()
export default authService
