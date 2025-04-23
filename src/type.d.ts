import { TokenPayload } from '~/types/jwt.types'
import { Server as IOServer } from 'socket.io'
declare global {
  namespace Express {
    interface Request {
      decodedAccessToken: TokenPayload
    }

    interface Application {
      get(name: 'io'): IOServer
    }
  }
}
