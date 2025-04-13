import { Router } from 'express'
import { requireLogin } from '~/middlewares/auth'
import * as controller from '~/controllers/accounts.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/middlewares/validate'
import { ChangePasswordBody, ChangePasswordV2Body, UpdateMeBody } from '~/validations/accounts.validations'

const accountRouter = Router()

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

export default accountRouter
