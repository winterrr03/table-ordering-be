import { Router } from 'express'
import { requireLogin, requireOneOfRoles } from '~/middlewares/auth'
import * as controller from '~/controllers/tables.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/middlewares/validate'
import { CreateTableBody, TableParams, UpdateTableBody } from '~/validations/tables.validations'
import { Role } from '~/constants/types'

const tableRouter = Router()

/**
 * Description. Get list table
 * Path: /
 * Method: GET
 */
tableRouter.get('/', wrapRequestHandler(controller.getTableListController))

/**
 * Description. Create table
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { CreateTableBodyType }
 */
tableRouter.post(
  '/',
  requireLogin,
  requireOneOfRoles(Role.Owner, Role.Employee),
  validate({ body: CreateTableBody }),
  wrapRequestHandler(controller.createTableController)
)

/**
 * Description. Detail table
 * Path: /:id
 * Method: GET
 * Params: { id: string }
 */
tableRouter.get('/:id', validate({ params: TableParams }), wrapRequestHandler(controller.getTableDetailController))

/**
 * Description. Update table
 * Path: /:id
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Params: { id: string }
 * Body: { body: UpdateTableBody }
 */
tableRouter.patch(
  '/:id',
  requireLogin,
  requireOneOfRoles(Role.Owner, Role.Employee),
  validate({ params: TableParams, body: UpdateTableBody }),
  wrapRequestHandler(controller.updateTableController)
)

/**
 * Description. Delete table
 * Path: /:id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 * Params: { id: string }
 */
tableRouter.delete(
  '/:id',
  requireLogin,
  requireOneOfRoles(Role.Owner, Role.Employee),
  validate({ params: TableParams }),
  wrapRequestHandler(controller.deleteTableController)
)

export default tableRouter
