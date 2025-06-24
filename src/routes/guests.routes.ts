import { Router } from 'express'
import { validate } from '~/middlewares/validate'
import { LogoutBody, RefreshTokenBody } from '~/validations/auth.validations'
import {
  GuestCreateOrdersBody,
  GuestCreatePaymentLinkBody,
  GuestGetOrdersParams,
  GuestLoginBody,
  WebhookDataBody
} from '~/validations/guests.validations'
import * as controller from '~/controllers/guests.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
import { requireLogin, requireOneOfRoles } from '~/middlewares/auth'
import { Role } from '~/constants/types'

const guestRouter = Router()

/**
 * Description. Guest info
 * Path: /info
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
guestRouter.get(
  '/info',
  requireLogin,
  requireOneOfRoles(Role.Guest),
  wrapRequestHandler(controller.guestInfoController)
)

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

/**
 * Description. Guest create orders
 * Path: /orders
 * Method: POST
 * Body: { GuestCreateOrdersBody }
 */
guestRouter.post(
  '/orders',
  requireLogin,
  requireOneOfRoles(Role.Guest),
  validate({ body: GuestCreateOrdersBody }),
  wrapRequestHandler(controller.guestCreateOrdersController)
)

/**
 * Description. Guest get orders
 * Path: /orders/:guest_session_id
 * Method: GET
 * Body: { refreshToken: string }
 */
guestRouter.get(
  '/orders/:guest_session_id',
  requireLogin,
  requireOneOfRoles(Role.Guest),
  validate({ params: GuestGetOrdersParams }),
  wrapRequestHandler(controller.guestGetOrdersController)
)

/**
 * Description. Guest create payment link
 * Path: /payment-link
 * Method: POST
 * Body: GuestCreatePaymentLinkBody
 */
guestRouter.post(
  '/payment-link',
  requireLogin,
  requireOneOfRoles(Role.Guest),
  validate({ body: GuestCreatePaymentLinkBody }),
  wrapRequestHandler(controller.guestCreatePaymentLinkController)
)

/**
 * Description. Guest receive hook payment
 * Path: /receive-hook
 * Method: POST
 */
guestRouter.post(
  '/receive-hook',
  // validate({ body: WebhookDataBody }),
  wrapRequestHandler(controller.guestReceiveHookPaymentController)
)

export default guestRouter
