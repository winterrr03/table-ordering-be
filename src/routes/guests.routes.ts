import { Router } from 'express'
import { validate } from '~/middlewares/validate'
import { LogoutBody, RefreshTokenBody } from '~/validations/auth.validations'
import { GuestLoginBody } from '~/validations/guests.validations'
import * as controller from '~/controllers/guests.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
import { requireLogin } from '~/middlewares/auth'

const guestRouter = Router()

/**
 * Description. Login
 * Path: /auth/login
 * Method: POST
 * Body: { phone: string }
 */
guestRouter.post('/auth/login', validate({ body: GuestLoginBody }), wrapRequestHandler(controller.guestLoginController))

/**
 * Description. Logout
 * Path: /auth/logout
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { refreshToken: string, activatedAt: number }
 */
guestRouter.post(
  '/auth/logout',
  requireLogin,
  validate({ body: LogoutBody }),
  wrapRequestHandler(controller.guestLogoutController)
)

/**
 * Description. Refresh token
 * Path: /auth/refresh-token
 * Method: POST
 * Body: { refreshToken: string }
 */
guestRouter.post(
  '/auth/refresh-token',
  validate({ body: RefreshTokenBody }),
  wrapRequestHandler(controller.guestRefreshTokenController)
)

export default guestRouter
