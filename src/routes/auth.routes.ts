import { Router } from 'express'
import { validate } from '~/middlewares/validate'
import { LoginBody, LoginGoogleQuery, LogoutBody, RefreshTokenBody } from '~/validations/auth.validations'
import * as controller from '~/controllers/auth.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
import { requireLogin } from '~/middlewares/auth'

const authRouter = Router()

/**
 * Description. Login
 * Path: /login
 * Method: POST
 * Body: { email: string, password: string }
 */
authRouter.post('/login', validate({ body: LoginBody }), wrapRequestHandler(controller.loginController))

/**
 * Description. Logout
 * Path: /logout
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { refreshToken: string }
 */
authRouter.post(
  '/logout',
  requireLogin,
  validate({ body: LogoutBody }),
  wrapRequestHandler(controller.logoutController)
)

/**
 * Description. Refresh token
 * Path: /refresh-token
 * Method: POST
 * Body: { refreshToken: string }
 */
authRouter.post(
  '/refresh-token',
  validate({ body: RefreshTokenBody }),
  wrapRequestHandler(controller.refreshTokenController)
)

/**
 * Description. Login google
 * Path: /login/google
 * Method: GET
 * Query: { code: string }
 */
authRouter.get(
  '/login/google',
  validate({ query: LoginGoogleQuery }),
  wrapRequestHandler(controller.loginGoogleController)
)

export default authRouter
