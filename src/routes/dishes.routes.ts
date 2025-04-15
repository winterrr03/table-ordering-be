import { Router } from 'express'
import { requireLogin, requireOneOfRoles } from '~/middlewares/auth'
import * as controller from '~/controllers/dishes.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/middlewares/validate'
import {
  CreateDishBody,
  DishListWithPaginationQuery,
  DishParams,
  UpdateDishBody
} from '~/validations/dishses.validations'
import { Role } from '~/constants/types'

const dishRouter = Router()

/**
 * Description. Get list dish
 * Path: /
 * Method: GET
 */
dishRouter.get('/', wrapRequestHandler(controller.getDishListController))

/**
 * Description. Get list dish with pagination
 * Path: /
 * Method: GET
 */
dishRouter.get(
  '/pagination',
  validate({ query: DishListWithPaginationQuery }),
  wrapRequestHandler(controller.getDishListWithPaginationController)
)

/**
 * Description. Create dish
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { CreateDishBodyType }
 */
dishRouter.post(
  '/',
  requireLogin,
  requireOneOfRoles(Role.Owner, Role.Employee),
  validate({ body: CreateDishBody }),
  wrapRequestHandler(controller.createDishController)
)

/**
 * Description. Detail dish
 * Path: /:id
 * Method: GET
 * Params: { id: string }
 */
dishRouter.get('/:id', validate({ params: DishParams }), wrapRequestHandler(controller.getDishDetailController))

/**
 * Description. Update dish
 * Path: /:id
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Params: { id: string }
 * Body: { body: UpdateDishBody }
 */
dishRouter.patch(
  '/:id',
  requireLogin,
  requireOneOfRoles(Role.Owner, Role.Employee),
  validate({ params: DishParams, body: UpdateDishBody }),
  wrapRequestHandler(controller.updateDishController)
)

/**
 * Description. Delete dish
 * Path: /:id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 * Params: { id: string }
 */
dishRouter.delete(
  '/:id',
  requireLogin,
  requireOneOfRoles(Role.Owner, Role.Employee),
  validate({ params: DishParams }),
  wrapRequestHandler(controller.deleteDishController)
)

export default dishRouter
