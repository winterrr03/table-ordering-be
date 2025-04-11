import { TokenPayload } from '~/types/jwt.types'
declare global {
  namespace Express {
    interface Request {
      decodedAccessToken: TokenPayload
    }
  }
}
