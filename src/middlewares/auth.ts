/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express'
import { AuthError } from '~/utils/errors'
import { verifyAccessToken } from '~/utils/jwt'

export const requireLogin = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers.authorization?.split(' ')[1]
  if (!accessToken) throw new AuthError('Không nhận được access token')
  try {
    const decodedAccessToken = verifyAccessToken(accessToken)
    req.decodedAccessToken = decodedAccessToken
    next()
  } catch (error) {
    throw new AuthError('Access token không hợp lệ')
  }
}
