import { Router } from 'express'
import { requireLogin } from '~/middlewares/auth'
import * as controller from '~/controllers/accounts.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/middlewares/validate'
import { UpdateMeBody } from '~/validations/accounts.validations'

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

export default accountRouter
