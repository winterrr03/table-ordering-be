import { Server as IOServer } from 'socket.io'
import http from 'http'
import { AuthError } from '~/utils/errors'
import { verifyAccessToken } from '~/utils/jwt'
import { ManagerRoom, Role } from '~/constants/types'
import databaseService from '~/services/database.services'
import envConfig from '~/config'

export const setupSocketIO = async (server: http.Server) => {
  const io = new IOServer(server, {
    cors: {
      origin: envConfig.CLIENT_URL
    }
  })

  io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth

    if (!Authorization) {
      return next(new AuthError('Authorization không hợp lệ'))
    }

    const accessToken = Authorization.split(' ')[1]
    try {
      const decodedAccessToken = verifyAccessToken(accessToken)
      const { userId, role } = decodedAccessToken

      const socketDoc = {
        socket_id: socket.id,
        account_id: role === Role.Guest ? '' : userId,
        guest_id: role === Role.Guest ? userId : ''
      }

      const filter = role === Role.Guest ? { guest_id: socketDoc.guest_id } : { account_id: socketDoc.account_id }

      await databaseService.sockets.updateOne(filter, { $set: socketDoc }, { upsert: true })

      if (role !== Role.Guest) {
        socket.join(ManagerRoom)
      }

      socket.handshake.auth.decodedAccessToken = decodedAccessToken
      next()
    } catch (error: any) {
      next(error)
    }
  })

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)

    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })
  return io
}
