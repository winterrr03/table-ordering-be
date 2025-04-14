import { Router } from 'express'
import { requireLogin, requireOneOfRoles } from '~/middlewares/auth'
import * as controller from '~/controllers/accounts.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/middlewares/validate'
import {
  AccountIdParam,
  ChangePasswordBody,
  ChangePasswordV2Body,
  CreateEmployeeAccountBody,
  UpdateEmployeeAccountBody,
  UpdateMeBody
} from '~/validations/accounts.validations'
import { Role } from '~/constants/types'

const accountRouter = Router()

/**
 * Description. Get list account
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
accountRouter.get(
  '/',
  requireLogin,
  requireOneOfRoles(Role.Owner),
  wrapRequestHandler(controller.getAccountListController)
)

/**
 * Description. Create account employee
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { name, email, avatar, password, confirmPassowrd: string }
 */
accountRouter.post(
  '/',
  requireLogin,
  requireOneOfRoles(Role.Owner),
  validate({ body: CreateEmployeeAccountBody }),
  wrapRequestHandler(controller.createEmployeeAccountController)
)

/**
 * Description. Get me
 * Path: /me
 * Method: GET
 */
accountRouter.get('/me', requireLogin, wrapRequestHandler(controller.getMeController))

/**
 * Description. Update me
 * Path: /me
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Body: { name: string, avatar?: string }
 */
accountRouter.patch(
  '/me',
  requireLogin,
  validate({ body: UpdateMeBody }),
  wrapRequestHandler(controller.updateMeController)
)

/**
 * Description. Change password
 * Path: /change-password
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Body: { oldPassword: string, password: string, confirmPassword }
 */
accountRouter.patch(
  '/change-password',
  requireLogin,
  validate({ body: ChangePasswordBody }),
  wrapRequestHandler(controller.changePasswordController)
)

/**
 * Description. Change password v2
 * Path: /change-password-v2
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Body: { oldPassword: string, password: string, confirmPassword }
 */
accountRouter.patch(
  '/change-password-v2',
  requireLogin,
  validate({ body: ChangePasswordV2Body }),
  wrapRequestHandler(controller.changePasswordV2Controller)
)

/**
 * Description. Detail employee account
 * Path: /detail/:id
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Params: { id: string }
 */
accountRouter.get(
  '/detail/:id',
  requireLogin,
  requireOneOfRoles(Role.Owner),
  validate({ params: AccountIdParam }),
  wrapRequestHandler(controller.getEmployeeAccountController)
)

/**
 * Description. Update employee account
 * Path: /detail/:id
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Params: { id: string }
 * Body: { body: UpdateEmployeeAccountBody }
 */
accountRouter.patch(
  '/detail/:id',
  requireLogin,
  requireOneOfRoles(Role.Owner),
  validate({ params: AccountIdParam, body: UpdateEmployeeAccountBody }),
  wrapRequestHandler(controller.updateEmployeeAccountController)
)

/**
 * Description. Delete employee account
 * Path: /detail/:id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 * Params: { id: string }
 */
accountRouter.delete(
  '/detail/:id',
  requireLogin,
  requireOneOfRoles(Role.Owner),
  validate({ params: AccountIdParam }),
  wrapRequestHandler(controller.deleteEmployeeAccountController)
)

export default accountRouter
