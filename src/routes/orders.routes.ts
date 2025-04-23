import { Router } from 'express'
import { requireLogin, requireOneOfRoles } from '~/middlewares/auth'
import * as controller from '~/controllers/orders.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/middlewares/validate'
import {
  CreateDishBody,
  DishListWithPaginationQuery,
  DishParams,
  UpdateDishBody
} from '~/validations/dishses.validations'
import { Role } from '~/constants/types'
import {
  CreateOrdersBody,
  GetOrdersQueryParams,
  OrderParams,
  PayGuestOrdersBody,
  UpdateOrderBody
} from '~/validations/orders.validations'

const orderRouter = Router()

/**
 * Description. Get list order
 * Path: /
 * Header: { Authorization: Bearer <access_token> }
 * Method: GET
 */
orderRouter.get(
  '/',
  requireLogin,
  requireOneOfRoles(Role.Owner, Role.Employee),
  validate({ query: GetOrdersQueryParams }),
  wrapRequestHandler(controller.getOrdersController)
)

/**
 * Description. Create order
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { CreateOrdersBody }
 */
orderRouter.post(
  '/',
  requireLogin,
  requireOneOfRoles(Role.Owner, Role.Employee),
  validate({ body: CreateOrdersBody }),
  wrapRequestHandler(controller.createOrdersController)
)

/**
 * Description. Detail order
 * Path: /:id
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Params: { id: string }
 */
orderRouter.get(
  '/:id',
  requireLogin,
  requireOneOfRoles(Role.Owner, Role.Employee),
  validate({ params: OrderParams }),
  wrapRequestHandler(controller.getOrderDetailController)
)

/**
 * Description. Pay orders
 * Path: /pay
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 */
orderRouter.patch(
  '/pay',
  requireLogin,
  requireOneOfRoles(Role.Owner, Role.Employee),
  validate({ body: PayGuestOrdersBody }),
  wrapRequestHandler(controller.payOrdersController)
)

/**
 * Description. Update order
 * Path: /:id
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Params: { id: string }
 * Body: { body: UpdateOrderBody }
 */
orderRouter.patch(
  '/:id',
  requireLogin,
  requireOneOfRoles(Role.Owner, Role.Employee),
  validate({ params: OrderParams, body: UpdateOrderBody }),
  wrapRequestHandler(controller.updateOrderController)
)

export default orderRouter
